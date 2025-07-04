import React, { useState } from "react";
import '../styles/components/Apitemp.scss';

const Apitemp = () => {
  const [lugar, setLugar] = useState("");
  const [resultado, setResultado] = useState(null);
  const [proximas, setProximas] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Buscar coordenadas via Nominatim
      const responseCoords = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`);
      const dataCoords = await responseCoords.json();

      if (!dataCoords.length) {
        alert("Local não encontrado.");
        return;
      }

      const latitude = dataCoords[0].lat;
      const longitude = dataCoords[0].lon;

      // Chamar sua API Django com as coordenadas
      const response = await fetch(`http://localhost:8000/api/clima/?lat=${latitude}&lon=${longitude}`);
      const dados = await response.json();

      // Buscar previsão para as próximas 6 horas
      const responseProximas = await fetch(
        `http://localhost:8000/api/proximas/?lat=${latitude}&lon=${longitude}`
      );
      const dadosProximas = await responseProximas.json();

      // Formatar a resposta
      const formatado = dadosProximas.map((hora) => ({
        horario: new Date(hora.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperatura: `${hora.values.temperature}°C`,
      }));

      setProximas(formatado);

      // Resultado principal
      setResultado({
        atual: dados.data?.values?.temperature ?? "",
        amanha: "26°C", // Pode ajustar conforme necessário
      });
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao buscar informações.");
    }
  };

  return (
    <div className="apitemp">
      <h1>Veja a temperatura de qualquer lugar aqui</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="lugar">Digite o nome do lugar que deseja ver:</label>
        <input
          type="text"
          id="lugar"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          placeholder="Ex: São Paulo, Brasil"
        />
        <button type="submit">Buscar</button>
      </form>

      {resultado && (
        <div className="resultado">
          <h2>Resultado para: {lugar}</h2>
          <p>
            <strong>Temperatura atual:</strong> {resultado.atual}°C
          </p>
          <div>
            <strong>Próximas horas:</strong>
            <ul>
              {proximas.map((item, index) => (
                <li key={index}>{item.horario} - {item.temperatura}</li>
              ))}
            </ul>
          </div>
          <p>
            <strong>Amanhã:</strong> {resultado.amanha}
          </p>
        </div>
      )}
    </div>
  );
};

export default Apitemp;
