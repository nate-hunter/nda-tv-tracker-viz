async function drawLineChart() {
  // const data = await d3.csv('../../data/data-demo/start-dates-6-23-21.csv');
  const data = await d3.csv('./data/start-dates-6-23-21.csv');

  const yAccessor = d => +d['totalScheduled'];
  const parseDate = d3.timeParse('%m/%d/%Y');
  const xAccessor = d => parseDate(d['startDate']);


  let dimensions = {
    width: window.innerWidth * 0.65,
    height: 400,
    margins: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60
    }
  };

  dimensions.boundedWidth = dimensions.width 
    - dimensions.margins.left 
    - dimensions.margins.right;
  
  dimensions.boundedHeight = dimensions.height 
    - dimensions.margins.top 
    - dimensions.margins.bottom;

  const wrapper = d3.select('#wrapper')
    .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);
  
  const bounds = wrapper.append('g')
      .style('transform', `translate(${
          dimensions.margins.left
      }px, ${
          dimensions.margins.top
      }px)`);

  const yScale = d3.scaleLinear()
    .domain([0, 50])
    .range([dimensions.boundedHeight, 0])
  

  const avgScheduled = yScale(d3.mean(data, yAccessor));
  const avgScheduledRect = bounds.append('rect')
      .attr('x', 0)
      .attr('width', dimensions.boundedWidth)
      .attr('y', avgScheduled)
      .attr('height', dimensions.boundedHeight - avgScheduled)
      .attr('fill', 'none')
      .attr('stroke', '#e0f3f3');
  
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth]);

  const lineGenerator = d3.line()
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(yAccessor(d)));

  const line = bounds.append('path')
      .attr('d', lineGenerator(data))
      .attr('fill', 'none')
      .attr('stroke', '#f99595')
      .attr('stroke-width', 2);
  
  const yAxisGenerator = d3.axisLeft()
      .scale(yScale);

  const yAxis = bounds.append('g')
      .attr('class', 'y-axis')
      .call(yAxisGenerator);

  const xAxisGenerator = d3.axisBottom()
      .scale(xScale);
  
  const xAxis = bounds.append('g')
      .attr('class', 'x-axis')
      .call(xAxisGenerator)
      .style('transform', `translateY(${dimensions.boundedHeight}px)`);
}

drawLineChart();




