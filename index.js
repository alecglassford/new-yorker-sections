'use strict';

var reset;
var rows;
var viz = d3.select('#viz');

function dotGenerator(max) {
    return function(val) {
        return '.'.repeat(val/max * 80);
    };
}

function sortByLength (a, b) {
    return d3.descending(a.values.length, b.values.length);
}

function sortByDate (a, b) {
    return d3.descending(a.date, b.date);
}

d3.csv('new-yorker-sections.csv', function(rows) {
    reset = function() {
        var sections = d3.nest()
            .key(d => d.section_name)
            .entries(rows)
            .sort(sortByLength);
        updateSections(sections);
        var authors = d3.nest()
            .key(d => d.author_name)
            .entries(rows)
            .sort(sortByLength);
        updateAuthors(authors);
        viz.select('#articles').html('');
    };
    d3.select('#reset').on('click', reset);
    reset();
});

function selectAuthor(section_data) {
    d3.select('#authors')
        .selectAll('div')
        .classed('selected', false);
    d3.select(this)
        .classed('selected', true);

    var sections = d3.nest()
        .key(d => d.section_name)
        .entries(section_data.values)
        .sort(sortByLength);
    updateSections(sections);
    var articles = sections.map(d => d.values)
        .reduce((a,b)=>a.concat(b))
        .sort(sortByDate);
    updateArticles(articles);
}

function updateSections(sections) {
    var sectionDots = dotGenerator(sections[0].values.length);
    viz.select('#sections').html('');
    viz.select('#sections')
        .selectAll('div')
        .data(sections)
        .enter()
            .append('div')
            .attr('class', 'item')
            .html(d => (d.key.length ? d.key : 'No section listed') + ' ' +  '<br>' + sectionDots(d.values.length) + ' ' + String(d.values.length))
            .on('click', selectSection);
}

function selectSection(author_data) {
    d3.select('#sections')
        .selectAll('div')
        .classed('selected', false);
    d3.select(this)
        .classed('selected', true);

    var authors = d3.nest()
        .key(d => d.author_name)
        .entries(author_data.values)
        .sort(sortByLength);
    updateAuthors(authors);
    var articles = authors.map(d => d.values)
        .reduce((a,b)=>a.concat(b))
        .sort(sortByDate);
    updateArticles(articles);
}

function updateAuthors(authors) {
    var authorDots = dotGenerator(authors[0].values.length);
    viz.select('#authors').html('');
    viz.select('#authors')
        .selectAll('div')
        .data(authors)
        .enter()
            .append('div')
            .attr('class', 'item')
            .html(d => (d.key.length ? d.key : 'No author listed') + ' ' +  '<br>' + authorDots(d.values.length) + ' ' + String(d.values.length))
            .on('click', selectAuthor);
}

function updateArticles(articles) {
    viz.select('#articles').html('');
    viz.select('#articles')
        .selectAll('div')
        .data(articles)
        .enter()
            .append('div')
            .attr('class', 'item')
            .html(function(d) {
                return `<a href="${d.article_url}"><strong>${d.article_name}</strong></a><br>
                        by <a href="${d.author_url}">${d.author_name}</a><br>
                        in <a href="${d.section_url}">${d.section_name}</a><br>
                        on ${d.date}
                        <p>${d.summary_text}</p>`;
            });
}
