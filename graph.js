const svgWidth = 560;
const svgHeight = 400;
const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = svgWidth - margin.left - margin.right;
const graphHeight = svgHeight - margin.top - margin.bottom;

const svg = d3.select('.canvas')
    .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

const g = svg.append('g') 
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Scale setup:
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

// Axis group setup:
const xAxisGroup = g.append('g') 
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${graphHeight})`)

const yAxisGroup = g.append('g')
    .attr('class', 'y-axis')

// Generate line path:
const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.episodeCount));

const path = g.append('path');

// Add dotted line to hovered data point
const dottedLineG = g.append('g')
    .attr('class', 'dotted-lines');

const xDottedLine = dottedLineG.append('line')
const yDottedLine = dottedLineG.append('line')

const update = (data) => {
    data = data.filter(dataObj => dataObj.studio === studio);  // Filters data points only w/the selected studio
    // if dataObj.studio === 'all' return dataObj  // Implement something like this to show all data points

    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Set scale domains:
    x.domain(d3.extent(data, d => new Date(d.date)));
    y.domain([0, d3.max(data, d => d.episodeCount)]);

    // Updates 'path' data
    path.data([data])
        .attr('fill', 'none')
        .attr('stroke', '#fffde7')
        .attr('stroke-width', 2)
        .attr('d', line)

    // Create circles
    const circles = g.selectAll('circle')
        .data(data)

    circles.exit().remove();

    circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.episodeCount))

    circles.enter()
        .append('circle')
            .attr('r', 5)
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.episodeCount))
            .attr('fill', '#fffde7')

    g.selectAll('circle')
        .on('mouseover', (d, i, n) => {
            console.log('d:', d)
            console.log(graphHeight)
            console.log(y(d.episodeCount))
            d3.select(n[i])
                .transition().duration(100)
                    .attr('r', 8)
                    .attr('fill', '#fff')
            xDottedLine
                .attr('x1', x(new Date(d.date)))
                .attr('x2', x(new Date(d.date)))
                .attr('y1', y(d.episodeCount))
                .attr('y2', graphHeight)
                .attr('stroke', "#fff59d")
                .attr('stroke-width', 1)
            yDottedLine 
                .attr('x1', x(new Date(d.date)))
                .attr('x2', 0)
                .attr('y1', y(d.episodeCount))
                .attr('y2', y(d.episodeCount))
                .attr('stroke', "#fff59d")
                .attr('stroke-width', 1)  
            dottedLineG
                .transition().duration(50)
                .style('opacity', 1)
                .style("stroke-dasharray", ("3, 3"))
        })
        .on('mouseleave', (d, i, n) => {
            d3.select(n[i])
                .transition().duration(500)
                    .attr('r', 4)
                    .attr('fill', '#fffde7')
            dottedLineG
                .transition().duration(50)
                .style('opacity', 0)
                .style("stroke-dasharray", ("3, 3"))
        })

    // Create axis:
    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'));

    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + ' eps.');

    // Call axis:
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // Rotates axis text:
    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')
}

let data = [];

db.collection('nda-studios').onSnapshot(resp => {
    resp.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id }

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id === doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    });

    update(data);
})