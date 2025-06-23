import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type{ ExpenseByCategory } from '../../types';

interface PieChartProps {
  data: ExpenseByCategory[];
  width?: number;
  height?: number;
}

const PieChart = ({ data, width = 450, height = 450 }: PieChartProps) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const margin = 40;

  useEffect(() => {
    if (data && ref.current) {
      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const radius = Math.min(width, height) / 2 - margin;

      const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const pie = d3.pie<ExpenseByCategory>()
        .value(d => parseFloat(d.total));
      
      const path = d3.arc<d3.PieArcDatum<ExpenseByCategory>>()
        .outerRadius(radius)
        .innerRadius(0);

      const label = d3.arc<d3.PieArcDatum<ExpenseByCategory>>()
        .outerRadius(radius)
        .innerRadius(radius - 80);

      const arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", path)
        .attr("fill", (d) => color(d.data.category__name));

      arcs.append("text")
        .attr("transform", (d) => `translate(${label.centroid(d)})`)
        .text((d) => d.data.category__name)
        .style("font-size", "12px")
        .style("fill", "white")
        .style("text-anchor", "middle");
    }
  }, [data, width, height]);

  return <svg ref={ref} width={width} height={height}></svg>;
};

export default PieChart;