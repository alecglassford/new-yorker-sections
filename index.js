'use strict';

var reset;
var rows;
var viz = d3.select('#viz');

function dotGenerator(max) {
    return function(val) {
        return '.'.repeat(val/max * 100);
    };
}

function sortByLength (a, b) {
    return d3.descending(a.values.length, b.values.length);
}

d3.csv('new-yorker-sections.csv', function(rows) {
    reset = function() {
        var sections = d3.nest()
            .key(d => d.section_name)
            .entries(rows)
            .sort(sortByLength);
        updateSections(sections);
    };
    d3.select('#reset').on('click', reset);
    reset();
});

function selectSection(section_data) {
    var sections = d3.nest()
        .key(d => d.section_name)
        .entries(section_data.values)
        .sort(sortByLength);
    updateSections(sections);
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
            .html(d => (d.key.length ? d.key : 'No author listed') + ' ' +  '<br>' + sectionDots(d.values.length) + ' ' + String(d.values.length))
            .on('click', selectAuthor);
}

function selectAuthor(author_data) {
    var authors = d3.nest()
        .key(d => d.author_name)
        .entries(author_data.values)
        .sort(sortByLength);
    updateAuthors(authors);
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
            .on('click', selectSection);
}
