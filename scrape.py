#!/usr/bin/env python

import csv

from bs4 import BeautifulSoup
import requests

first_url = 'http://www.newyorker.com/magazine/2017/02/13'
last_url = 'http://www.newyorker.com/magazine/2007/01/08'
columns = ['article_name', 'author_name', 'section_name', 'date', 'summary_text', 'article_url', 'author_url', 'section_url']

def issue_date(url):
    parts = url.split('/')
    return '-'.join(parts[-3:])

def extract_section(article):
    section = article.select_one('h4.rubric')
    if section:
        section_name = section.get_text(strip=True)
        section_url = section.a.get('href')
    else:
        section_name, section_url = None, None
    return section_name, section_url

def extract_headline(article):
    article_name = article.h2.get_text(strip=True)
    article_url = article.h2.a.get('href')
    return article_name, article_url

def extract_author(article):
    author = article.select_one('h3')
    if author:
        author_name = article.h3.a.get_text(strip=True)
        author_url = article.h3.a.get('href')
    else:
        author_name, author_url = None, None
    return author_name, author_url

def extract_summary(article):
    summary = article.select_one('p.p-summary')
    if summary:
        summary_text = summary.get_text(strip=True)
    else:
        summary_text = None
    return summary_text

def extract_from_article(article, date):
    section_name, section_url = extract_section(article)
    article_name, article_url = extract_headline(article)
    author_name, author_url = extract_author(article)
    summary_text = extract_summary(article)
    return article_name, author_name, section_name, date, summary_text, article_url, author_url, section_url

def scrape_issue(url):
    result = []
    date = issue_date(url)
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'lxml')
    articles = soup.select('article')
    for article in articles:
        row = extract_from_article(article, date)
        result.append(row)
    next_url = soup.select_one('a.nav-sprite-prev').get('href')
    return result, next_url

url = first_url
rows = []
while (url != last_url):
    print('Getting', url)
    new_rows, url = scrape_issue(url)
    rows.extend(new_rows)
    print('Done')
print('Finished scraping. Saving...')
with open('new-yorker-sections.csv', 'w', newline = '') as output:
    csv_writer = csv.writer(output)
    csv_writer.writerow(columns)
    csv_writer.writerows(rows)
print('Saved CSV!')
