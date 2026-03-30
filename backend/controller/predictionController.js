const predictPovertyLevel = async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: data.error || "Prediction failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  predictPovertyLevel,
};