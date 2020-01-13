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

function prepareLineChartData(data) {
    // Group by year and extract revenue and budget.
    const groupBy = d => d.release_year;
    const reduceRevenue = values => d3.sum(values, leaf => leaf.revenue);
    const revenueMap = d3.rollup(data, reduceRevenue, groupBy);
    const reduceBudget = values => d3.sum(values, leaf => leaf.budget);
    const budgetMap = d3.rollup(data, reduceBudget, groupBy);

    // Convert rolled up maps to to arrays.
    const revenue = Array.from(revenueMap).sort((a, b) => a[0] - b[0]);
    const budget = Array.from(budgetMap).sort((a, b) => a[0] - b[0]);

    // Get an array of years our x scale and axis.
    const parseYear = d3.timeParse('%Y');
    const dates = revenue.map(d => parseYear(d[0]));

    // While we're at it, get the maximum y value for the y scale and axis.
    const yValues = [
        ...Array.from(revenueMap.values()),
        ...Array.from(budgetMap.values()),
    ];
    const yMax = d3.max(yValues);

    // Produce final data object.
    const lineData = {
        series: [
            {
                name: 'Revenue',
                color: 'dodgerblue',
                values: revenue.map(d => ({ date: parseYear(d[0]), value: d[1] })),
            },
            {
                name: 'Budget',
                color: 'darkorange',
                values: budget.map(d => ({ date: parseYear(d[0]), value: d[1] })),
            },
        ],
        dates: dates,
        yMax: yMax,
    };

    return lineData;
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
    const scatterData = prepareLineChartData(moviesClean);

    // Set up margins as per convention
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const svgWidth = 500;
    const svgHeight = 500;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Prepare Scales
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

    // Draw axes
    const xAxis = d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat(formatTicks)
        .tickSizeInner(-height)
        .tickSizeOuter(0);

    const xAxisDraw = svg
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0, ' + height + ')');
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


}


// Load data
d3.csv('movies.csv', type).then(res => {
    ready(res);
});

