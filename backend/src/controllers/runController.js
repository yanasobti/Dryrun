const javaService = require('../services/javaService');

exports.runCode = async (req, res) => {
  console.log("POST /run received");
  const code = req.body.code;

  if (!code) {
    return res.status(400).json({ success: false, error: "No code provided." });
  }

  try {
    const result = await javaService.runJavaCode(code);
    res.json(result);
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};

exports.visualizeCode = async (req, res) => {
  console.log("POST /visualize received");
  const code = req.body.code;

  if (!code) {
    return res.status(400).json({ success: false, error: "No code provided." });
  }

  try {
    const frames = await javaService.traceJavaCode(code);
    res.json(frames);
  } catch (error) {
    console.error("Visualization error:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};
