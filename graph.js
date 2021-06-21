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

const update = (data) => {
    data = data.filter(obj => obj.studio === studio)

    // Set scale domains:
    x.domain(d3.extent(data, d => new Date(d.date)));
    y.domain([0, d3.max(data, d => d.episodeCount)]);

    // Create circles
    const circles = g.selectAll('circle')
        .data(data)

    circles.exit().remove();

    circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.episodeCount))

    circles.enter()
        .append('circle')
            .attr('r', 4)
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.episodeCount))
            .attr('fill', '#fffde7')

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