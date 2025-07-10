import React, { useState, useRef, useEffect } from "react";
import type { GraphData } from "../page";

interface PromptCLIProps {
  setGraph: (graph: GraphData) => void;
  exampleGraph: GraphData;
}

const PromptCLI: React.FC<PromptCLIProps> = ({ setGraph, exampleGraph }) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      setHistory((prev) => [...prev, input]);
      // "그래프 생성" 명령어 입력 시 그래프 생성
      console.log(input.trim());
      setGraph(exampleGraph);
    //   if (input.trim() == "그래프 생성") {
    //     setGraph(exampleGraph);
    //   }
      setInput("");
    }
  };

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div
      style={{
        background: "#1e1e1e",
        color: "#d4d4d4",
        borderRadius: 8,
        padding: 16,
        width: 480,
        height: 720,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: 12,
          fontFamily: "monospace",
          fontSize: 15,
          background: "#181818",
          borderRadius: 4,
          padding: 8,
        }}
      >
        {history.map((cmd, idx) => (
          <div key={idx} style={{ whiteSpace: "pre-wrap" }}>
            <span style={{ color: "#4ec9b0" }}>&gt; </span>
            {cmd}
          </div>
        ))}
        <div ref={historyEndRef} />
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="명령어를 입력하세요..."
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 4,
          border: "none",
          outline: "none",
          background: "#222",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 15,
        }}
        autoFocus
      />
    </div>
  );
};

export default PromptCLI;
