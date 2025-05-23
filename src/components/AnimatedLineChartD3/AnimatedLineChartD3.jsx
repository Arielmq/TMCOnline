// src/components/AnimatedSingleLineChartD3.jsx
import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';

function makeData() {
  const d = [];
  let prev = 100;
  for (let i = 0; i < 1000; i++) {
    prev += 5 - Math.random() * 10;
    d.push({ x: i, y: prev });
  }
  return d;
}

export default function AnimatedSingleLineChartD3({
  width = 500,
  height = 240,
  margin = { top: 20, right: 20, bottom: 30, left: 50 },
  easingName = 'easeCubicOut',
}) {
  const svgRef = useRef();
  const [currentEasing] = useState(easingName);
  const data = useMemo(makeData, []);

  const easings = {
    easeLinear: d3.easeLinear,
    easeQuadIn: d3.easeQuadIn,
    easeQuadOut: d3.easeQuadOut,
    easeCubicIn: d3.easeCubicIn,
    easeCubicOut: d3.easeCubicOut,
    easeSinIn: d3.easeSinIn,
    easeSinOut: d3.easeSinOut,
    easeExpIn: d3.easeExpIn,
    easeExpOut: d3.easeExpOut,
  };

  useEffect(() => {
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove();

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Escalas
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x))
      .range([0, innerW]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 300])      // dominio fijo 0–300
      .range([innerH, 0])    // 0 abajo, 300 arriba
      .clamp(true);

    // Generador de línea
    const lineGen = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    // Ejes
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).tickValues([0, 300]);

    // Grupo principal
    const g = svgEl
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis);

    g.append('g').call(yAxis);

    // Dibuja la línea
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', lineGen);

    // Animación
    const totalLen = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
      .attr('stroke-dashoffset', totalLen)
      .transition()
      .duration(4000)
      .ease(easings[currentEasing])
      .attr('stroke-dashoffset', 0);
  }, [data, width, height, margin, currentEasing, easings]);

  return (
    <div className="flex justify-center">
      <div style={{ maxHeight: 300, width }} className="overflow-hidden">
        <svg ref={svgRef} width={width} height={height} />
      </div>
    </div>
  );
}
