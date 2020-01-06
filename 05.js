// Data preparation
function filterData(data) {
    return data.filter(d => {
        return (
            d.release_year > 1999 &&
            d.release_year < 2010 &&
            d.revenue > 0 &&
            d.budget > 0 &&
            d.genre &&
            d.title
        );
    });
}

function prepareScatterData(data) {
    return data.sort((a, b) => b.budget - a.budget).filter((d, i) => i < 100);
}

// Data utilities
const parseNA = string => (string === 'NA' ? undefined : string);
const parseDate = string => d3.timeParse('%Y-%m-%d')(string);

// Type conversion
function type(d) {
    const date = parseDate(d.release_date);
    return {
        budget: +d.budget,
        genre: parseNA(d.genre),
        genres: JSON.parse(d.genres).map(d => d.name),
        homepage: parseNA(d.homepage),
        id: +d.id,
        imdb_id: parseNA(d.imdb_id),
        original_language: parseNA(d.original_language),
        overview: parseNA(d.overview),
        popularity: +d.popularity,
        poster_path: parseNA(d.poster_path),
        production_countries: JSON.parse(d.production_countries),
        release_date: date,
        release_year: date.getFullYear(),
        revenue: +d.revenue,
        runtime: +d.runtime,
        tagline: parseNA(d.tagline),
        title: parseNA(d.title),
        vote_average: +d.vote_average,
        vote_count: +d.vote_count
    };
}

// Main Function
function ready(movies) {

    const moviesClean = filterData(movies);
    const scatterData = prepareScatterData(moviesClean);
    console.log(scatterData);

    // Set up margins as per convention
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const svgWidth = 500;
    const svgHeight = 500;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Scales
    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(scatterData, d => d.budget))
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(scatterData, d => d.revenue))
        .range([height, 0]);

    // Draw base
    const svg = d3.select('.scatter-container')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ','  + margin.right + ')');   // The g element is positioned inside the 'svg'element using the transform function

    // Draw Scatter
    const bars = svg
        .selectAll('.scatter')
        .data(scatterData)
        .enter()
        .append('circle')
        .attr('class', 'scatter')
        .attr('cx', d => xScale(d.budget))
        .attr('cy', d => yScale(d.revenue))
        .attr('r', 3)
        .style('fill', 'green');

    function formatTicks(d) {
        return d3.format('~s')(d)
            .replace('M', ' mil')
            .replace('G', ' bil')
            .replace('T', ' tril');
    }

    // Draw axes
    const xAxis = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat(formatTicks)
        .tickSizeInner(-height)
        .tickSizeOuter(0);

    function addLabel(axis, label, x) {
        console.log('here');
        axis
            .selectAll('.tick:last-of-type text')
            .clone()
            .text(label)
            .attr('x', x)
            .style('text-anchor', 'start')
            .style('font-weight', 'bold')
            .style('fill', '#555');
    }

    const xAxisDraw = svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + height + ')');
        //.call(addLabel, 'Budget', 25);                      // Parameters to the call() function... The first parameter is always the axis. Other parameters are passed as additional comma separated values
    addLabel(xAxisDraw, 'Budget', 25);
    xAxis(xAxisDraw);

    const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat(formatTicks)
        .tickSizeInner(-height)
        .tickSizeOuter(0);

    const yAxisDraw = svg
        .append('g')
        .attr('class', 'y axis');
    yAxis(yAxisDraw);

}


// Load data
d3.csv('04_data/movies.csv', type).then(res => {
    ready(res);
});

