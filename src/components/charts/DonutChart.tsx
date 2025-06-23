// src/components/charts/DonutChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type{ ExpenseByCategory } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface DonutChartProps {
  data: ExpenseByCategory[];
  width?: number;
  height?: number;
}

const DonutChart = ({ data, width = 300, height = 300 }: DonutChartProps) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;
    const innerRadius = radius * 0.6; // This creates the donut hole

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Pie generator
    const pie = d3.pie<ExpenseByCategory>()
      .padAngle(0.02) // A little space between slices
      .sort(null)
      .value(d => parseFloat(d.total));

    // Arc generator
    const arc = d3.arc<d3.PieArcDatum<ExpenseByCategory>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("padding", "10px")
      .style("border-radius", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
      .style("color", "#333");

    // Draw slices
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.category__name))
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).transition().duration(200).attr("transform", "scale(1.05)");
        const percentage = (d.data.total / d3.sum(data, item => parseFloat(item.total))) * 100;
        tooltip.html(`<strong>${d.data.category__name}</strong><br/>${formatCurrency(d.data.total)} (${percentage.toFixed(1)}%)`)
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).transition().duration(200).attr("transform", "scale(1)");
        tooltip.style("visibility", "hidden");
      });

    // Clean up tooltip on component unmount
    return () => {
      tooltip.remove();
    };

  }, [data, width, height]);

  return <svg ref={ref} width={width} height={height}></svg>;
};

export default DonutChart;