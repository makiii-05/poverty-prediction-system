const ML_URL = process.env.ML_SERVICE_URL;

const predictPovertyLevel = async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error || "Prediction failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("predictPovertyLevel error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Prediction failed",
    });
  }
};

module.exports = {
  predictPovertyLevel,
};