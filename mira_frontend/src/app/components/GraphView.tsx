import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { GraphData, NodeDatum, LinkDatum } from "../page";

interface GraphViewProps {
  graph: GraphData | null;
}

const GraphView: React.FC<GraphViewProps> = ({ graph }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const w = 960;
  const h = 720;

  useEffect(() => {
    if (!graph || !svgRef.current) return;

    const width = w;
    const height = h;
    const centerX = width / 2;
    const centerY = height / 2;

    // main 노드 중앙 고정
    const nodes: NodeDatum[] = graph.nodes.map(node =>
      node.id === "main"
        ? { ...node, fx: centerX, fy: centerY }
        : { ...node }
    );

    // main을 중심으로 각도를 나눠서 초기 위치 지정 (스타형)
    const peripheralNodes = nodes.filter(n => n.id !== "main");
    const angleStep = (2 * Math.PI) / peripheralNodes.length;
    peripheralNodes.forEach((node, i) => {
      node.x = centerX + 180 * Math.cos(i * angleStep);
      node.y = centerY + 180 * Math.sin(i * angleStep);
    });

    const simulation = d3.forceSimulation<NodeDatum>(nodes)
      .force(
        "link",
        d3.forceLink<NodeDatum, LinkDatum>(graph.edges)
          .id((d: NodeDatum) => d.id)
          .distance(180)
      )
      .force("charge", d3.forceManyBody().strength(-700))
      .force("center", d3.forceCenter(centerX, centerY))
      .alpha(1)
      .alphaDecay(0.03);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Draw links (edge type별 스타일)
    const link = svg.append("g")
      .selectAll("line")
      .data(graph.edges)
      .enter().append("line")
      .attr("stroke", (d: LinkDatum) => d.type === "contains" ? "#aaa" : "#999")
      .attr("stroke-width", (d: LinkDatum) => d.type === "contains" ? 2 : 3)
      .attr("stroke-dasharray", (d: LinkDatum) => d.type === "contains" ? "6,4" : "0")
      .attr("stroke-opacity", 0.7);

    // Draw nodes (type별 스타일)
    const rectWidth = 90;
    const rectHeight = 60;
    const classWidth = 100;
    const classHeight = 60;
    const functionRadius = 28;

    // 클래스: 큰 사각형, 메서드: 작은 사각형, 함수: 원
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g");

    // 사각형(클래스)
    nodeGroup.filter(d => d.type === "class")
      .append("rect")
      .attr("width", classWidth)
      .attr("height", classHeight)
      .attr("rx", 10)
      .attr("fill", "#ffd54f")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // 사각형(메서드)
    nodeGroup.filter(d => d.type === "method")
      .append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("rx", 8)
      .attr("fill", "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // 원(함수)
    nodeGroup.filter(d => d.type === "function")
      .append("circle")
      .attr("r", functionRadius)
      .attr("fill", "#4fc3f7")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // 드래그
    nodeGroup.call(
      d3.drag<SVGGElement, NodeDatum>()
        .on("start", (event: d3.D3DragEvent<SVGGElement, NodeDatum, unknown>, d: NodeDatum) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: d3.D3DragEvent<SVGGElement, NodeDatum, unknown>, d: NodeDatum) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: d3.D3DragEvent<SVGGElement, NodeDatum, unknown>, d: NodeDatum) => {
          if (!event.active) simulation.alphaTarget(0);
        })
    );

    // Draw labels
    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", 15)
      .attr("pointer-events", "none")
      .attr("fill", "#222")
      .text((d: NodeDatum) => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: LinkDatum) => (typeof d.source === "object" ? d.source.x ?? 0 : 0))
        .attr("y1", (d: LinkDatum) => (typeof d.source === "object" ? d.source.y ?? 0 : 0))
        .attr("x2", (d: LinkDatum) => (typeof d.target === "object" ? d.target.x ?? 0 : 0))
        .attr("y2", (d: LinkDatum) => (typeof d.target === "object" ? d.target.y ?? 0 : 0));

      nodeGroup
        .attr("transform", (d: NodeDatum) => {
          if (d.type === "class") {
            return `translate(${(d.x ?? 0) - classWidth / 2}, ${(d.y ?? 0) - classHeight / 2})`;
          } else if (d.type === "method") {
            return `translate(${(d.x ?? 0) - rectWidth / 2}, ${(d.y ?? 0) - rectHeight / 2})`;
          } else if (d.type === "function") {
            return `translate(${d.x ?? 0}, ${d.y ?? 0})`;
          }
          return '';
        });

      // label 위치 보정
      nodeGroup.select("text")
        .attr("x", (d: NodeDatum) => {
          if (d.type === "class") return classWidth / 2;
          if (d.type === "method") return rectWidth / 2;
          return 0;
        })
        .attr("y", (d: NodeDatum) => {
          if (d.type === "class") return classHeight / 2;
          if (d.type === "method") return rectHeight / 2;
          return 0;
        });
    });

    // Clean up on unmount
    return () => simulation.stop();
  }, [graph]);

  return (
    <svg ref={svgRef} width={w} height={h} style={{ background: "#f5f5f5", borderRadius: 8 }} />
  );
};

export default GraphView; 