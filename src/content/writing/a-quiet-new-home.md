---
title: Why I Rebuilt My Website From Scratch
description: >-
  My old site was a Flutter app that looked great but was hard to keep. I
  rebuilt it as a simple, text-first website that will last for decades. Here
  is why I moved, what the previous site was, and the long term goal.
date: 2026-08-15
type: Meta
tags:
  - Meta
  - Astro
  - Writing
draft: false
---

This website used to be a Flutter app. It had animations, cards and a dark
theme, and it did what a portfolio does. But over time I realised it belonged
on a shelf, not on the internet. So I rebuilt it completely.

## The previous website

My old site lived at [champ96k.github.io](https://champ96k.github.io/#/). I built it a few years ago as a
Flutter experiment, one of the first projects that started this small corner
of the internet. Every page was a Flutter widget, which meant everything
rendered in the browser through JavaScript.

It looked nice. It had cards that moved, a dark theme, and projecting links
felt impressive. But that impressiveness came with a cost. Every change I
wanted to make, a new project, a new job, a new post, meant rebuilding and
redeploying an entire app just to change a few lines of text. The heavy
JavaScript bundle made the page slow to load. And when I visited it later, it
felt like a showroom, pretty to look at but hard to actually keep.

## Why I moved

The real reason I moved was ownership. I wanted a website that could last for
decades without needing constant maintenance. An app with animations asks a
lot of you. It needs libraries that get old, frameworks that change, and code
that eventually breaks. A static site with plain files asks very little.

There were smaller reasons too. The Flutter site was slow to load on slow
connections. It was hard to edit from anywhere, because the content was buried
inside code. And the design, while pretty, would have dated quickly. I kept
asking myself one question: do I want a website that impresses people for a
second, or one that serves me well for the next ten years?

I chose the second. So the new site is static, text-first and intentionally
boring. There is no feature that survives only to impress. The design is built
on typography, spacing and dates. Everything with a meaningful date is sorted
newest to oldest, automatically.

## Why a boring website

A personal website that lasts for a decade needs to be boring in the right
way. No gradients that look dated next year, no component library to upgrade
through, no JavaScript unless it earns its place. Just semantic HTML, a
handful of pages and content that is easy to edit years from now.

The whole site runs on content files. One YAML file holds every project.
Career, education, volunteering and values live in a few small files. Writing
is one Markdown file per post. Adding anything means editing data, not the
template. I can open any of these files in a plain text editor and the site
picks up the change when it rebuilds.

The pages are fast because there is almost nothing to load. A fresh build
produces a handful of static pages and a small stylesheet. It works on mobile,
it works on slow networks, and it will keep working long after the tooling I
used today is forgotten.

## The long term goal

The long term goal is simple: I want this to be a quiet archive that outlives
trends. Everything here, the projects, the contributions, the writing, the
places I worked and the values I hold, is stored as plain text that I fully
control. No database I have to maintain, no platform that can shut down, no
hosting bill that grows with complexity.

Writing here is meant to be easy enough that I actually keep doing it. Because
the real value of a personal site is not the design or the animations. It is
the habit of showing up and publishing, again and again, year after year.

So this is the archive. If you are reading this years from now, this is me
trying to keep a corner of the internet simple on purpose.