import { supabase } from '../lib/supabase';

export interface UserQuestionProgress {
  id?: string;
  user_id: string;
  question_id: string;
  pattern: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'not-started' | 'in-progress' | 'completed';
  last_step: number;
  completed_at?: string | null;
  last_attempted_at?: string;
}

export const progressService = {
  /**
   * Get progress for a specific question.
   */
  async getProgress(questionId: string): Promise<UserQuestionProgress | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_questions')
      .select('*')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
    return data;
  },

  /**
   * Save or update progress for a question.
   */
  async saveProgress(
    questionId: string,
    pattern: string,
    difficulty: 'easy' | 'medium' | 'hard',
    status: 'not-started' | 'in-progress' | 'completed' = 'in-progress',
    lastStep: number = 0
  ): Promise<UserQuestionProgress | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const lowerDifficulty = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';

    const updates: Partial<UserQuestionProgress> = {
      user_id: user.id,
      question_id: questionId,
      pattern: pattern,
      difficulty: lowerDifficulty,
      status: status,
      last_step: lastStep,
      last_attempted_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_questions')
      .upsert(updates, { onConflict: 'user_id,question_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving progress:', error);
      return null;
    }
    return data;
  },

  /**
   * Mark a question as completed.
   */
  async markCompleted(
    questionId: string,
    pattern: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<UserQuestionProgress | null> {
    return this.saveProgress(questionId, pattern, difficulty, 'completed', 0);
  },

  /**
   * Get all progress entries for the logged-in user.
   */
  async getAllProgress(): Promise<UserQuestionProgress[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_questions')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching all progress:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Toggle bookmark status of a question.
   */
  async toggleBookmark(questionId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if already bookmarked
    const { data: existing, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking bookmark:', checkError);
      return false;
    }

    if (existing) {
      // Delete bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing.id);
      
      if (deleteError) {
        console.error('Error deleting bookmark:', deleteError);
        return false;
      }
      return false; // Not bookmarked now
    } else {
      // Insert bookmark
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          question_id: questionId,
        });

      if (insertError) {
        console.error('Error inserting bookmark:', insertError);
        return false;
      }
      return true; // Bookmarked now
    }
  },

  /**
   * Get all bookmarked question IDs for the current user.
   */
  async getBookmarkedIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('bookmarks')
      .select('question_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
    return (data || []).map(b => b.question_id);
  }
};
