"use client";
import React, { useState } from "react";
import PromptCLI from "./components/promptCLI";
import GraphView from "./components/GraphView";
import type * as d3 from "d3";

// 타입 정의
interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "class" | "method" | "function";
  parent?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  type?: "call" | "contains";
}

export interface GraphData {
  nodes: NodeDatum[];
  edges: LinkDatum[];
  type: string;
}

export default function Home() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  // svgRef, d3 관련 useEffect 제거

  // 예시 데이터 (계층 구조 포함)
  const exampleGraph: GraphData = {
    nodes: [
      { id: "main", label: "main", type: "function" },
      { id: "foo", label: "foo", type: "class" },
      { id: "foo_methodA", label: "foo.methodA", type: "method", parent: "foo" },
      { id: "bar", label: "bar", type: "class" },
      { id: "bar_methodB", label: "bar.methodB", type: "method", parent: "bar" }
    ],
    edges: [
      { source: "foo_methodA", target: "main", type: "call" },
      { source: "bar_methodB", target: "main", type: "call" },
      { source: "foo", target: "foo_methodA", type: "contains" },
      { source: "bar", target: "bar_methodB", type: "contains" }
    ],
    type: "CALL_GRAPH"
  };

  // 기존 프롬프트 영역 제거, PromptCLI에 prop 전달
  return (
    <div className="p-4"style={{ display: "flex", flexDirection: "row", gap: 32, alignItems: "flex-start" }}>
      <PromptCLI setGraph={setGraph} exampleGraph={exampleGraph} />
      <div>
        <GraphView graph={graph} />
      </div>
    </div>
  );
}
