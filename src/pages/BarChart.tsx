import  { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type{ BudgetVsActual } from '../types';

interface BarChartProps {
  data: BudgetVsActual[];
}

const BarChart = ({ data }: BarChartProps) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(data.map(d => d.category_name))
      .padding(0.1);

    const x = d3.scaleLinear()
      .range([0, width])
      .domain([0, d3.max(data, d => Math.max(parseFloat(d.budgeted_amount), parseFloat(d.actual_amount)))!]);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    // Bars for Budgeted Amount
    g.selectAll(".bar-budget")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar-budget")
      .attr("y", d => y(d.category_name)!)
      .attr("height", y.bandwidth() / 2)
      .attr("x", 0)
      .attr("width", d => x(parseFloat(d.budgeted_amount)))
      .attr("fill", "#69b3a2");

    // Bars for Actual Amount
    g.selectAll(".bar-actual")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar-actual")
      .attr("y", d => y(d.category_name)! + y.bandwidth() / 2)
      .attr("height", y.bandwidth() / 2)
      .attr("x", 0)
      .attr("width", d => x(parseFloat(d.actual_amount)))
      .attr("fill", "#ff8c00");

  }, [data]);

  return <svg ref={ref} width={800} height={400}></svg>;
};

export default BarChart;