import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/enviar-pedido", async (req, res) => {
  const { mensaje } = req.body;

  try {
    await axios.post(
      "https://api.z-api.io/instances/TU_INSTANCE/token/TU_TOKEN/send-message",
      {
        phone: "541125128321", // a quién le llega
        message: mensaje
      }
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Error enviando WhatsApp" });
  }
});

app.listen(3000, () => console.log("Backend funcionando"));
