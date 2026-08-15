---
title: "From Flutter to Native Android: 30 Days at Gojek"
date: 2025-08-18T00:00:00+05:30
description: "A Flutter developer's honest account of transitioning to massive-scale native Android engineering at Gojek."
tags: [experience, career, android, flutter]
type: Career
draft: false
---

When I joined Gojek 30 days ago, I thought I had a pretty solid handle on mobile development. I'd spent the last few years building apps with Flutter, dabbling in React Native and SwiftUI, and diving deep into both frontend and backend work. My hands have touched everything from MERN stacks and Solidity-based blockchain projects to JavaScript, TypeScript, Python, and even a bit of Go and Java. I've worked with cloud platforms like AWS S3 and Azure, and written more than my fair share of shell scripts along the way.

So yeah, I was comfortable with cross-platform development. Confident, even.

But stepping into Gojek's world of massive-scale native Android engineering? That was a whole different beast. And it humbled me real quick.

## Day One: The Reality Check

Walking into Gojek's office for the first time was overwhelming. This is a company that processes over 3 million orders every day and has more than 10000+ engineers working on 21+ different products. The scale of everything here is just mind-blowing. My manager sat me down and explained that while Flutter is great, most of our core mobile infrastructure runs on native Android, especially for the driver apps that literally power Indonesia's economy.

The transition wasn't just about learning a new framework - it was about understanding how mobile engineering works at scale. At Gojek, we have 140+ Android and iOS engineers working on the same codebase, with around 1100 pipelines running every single day. This isn't your typical startup where you can just wing it and hope for the best.

## Week One: The Learning Curve Hits Hard

Coming from Flutter, I was used to the "write once, run anywhere" mentality. Dart felt familiar, hot reload was my best friend, and everything seemed so straightforward. But Android development? That's a completely different beast.

The first major shock was the Activity lifecycle. In Flutter, when you want to update the UI, you just call setState() or use your favorite state management solution. Android has this complex lifecycle with onCreate, onStart, onResume, onPause, onStop, and onDestroy methods that you absolutely must understand. Miss one of these, and your app will crash or behave unexpectedly.

My mentor showed me how Gojek handles this complexity. They've built sophisticated architecture patterns to make Android development more predictable. The driver apps, for instance, use hybrid architectural patterns that are fully testable and decoupled. This was my first lesson in how different enterprise Android development is from what you see in tutorials.

## The Technical Deep Dive: What I Actually Had to Learn

### Architecture Patterns - The Real Deal

Flutter developers are used to thinking about widgets and state management. Android forces you to think about Activities, Fragments, Services, and BroadcastReceivers. At Gojek, they don't just use the basic Android components - they've created their own design language system called Asphalt that standardizes how everything works across all their apps.

The MVVM pattern in Android isn't just a nice-to-have - it's essential when you're working on apps that millions of people depend on daily. ViewModels and LiveData became my new best friends, replacing the familiar Flutter patterns I was used to.

### State Management Reality

In Flutter, I could use Provider, Bloc, or Riverpod to manage state. Android's approach with ViewModels and LiveData felt foreign at first, but I started to appreciate the lifecycle-aware nature of these components. When you're building apps that need to handle phone calls, navigation changes, and background processing simultaneously, this lifecycle awareness becomes critical.

### The Performance Game

Gojek processes an average of 35 orders every second and handles more than 350 million internal API calls per second. When you're working at this scale, every optimization matters. Flutter's performance is generally good, but native Android gives you more granular control over memory management, threading, and resource usage.

I learned about Android's modular architecture approach, where the team actually modularized their entire driver app to improve build times and developer productivity. This level of optimization simply wasn't something I had to think about in my Flutter projects.

## The Cultural Shift: Engineering at Gojek Scale

### Code Quality Standards

At Gojek, code quality isn't just a suggestion - it's baked into the culture. They practice Test-Driven Development (TDD) and pair programming religiously. Coming from Flutter where testing sometimes felt optional, this was a major adjustment. Every line of code I write now has to go through unit tests, code quality checks, and regression tests.

The CI/CD pipeline here runs for about 45-50 minutes for each commit, including 10 minutes of tests, 20 minutes of builds, and 15 minutes of static analysis. With 10-20 commits per day per developer, that's a lot of pipeline time, but it ensures the quality that millions of users depend on.

### Collaboration at Scale

Working with 140+ mobile engineers requires a different approach to collaboration. The team uses GitLab Runner to manage parallel job execution and has developed sophisticated pipeline categorization to handle different functional and infrastructure requirements.

What impressed me most was how they handle the developer experience (devX). The devX team specifically focuses on making sure engineers can be productive despite the complexity of the codebase. This level of infrastructure investment was something I'd never experienced in smaller companies.

## The Practical Differences: Flutter vs Android Native

### Development Speed

Flutter's hot reload spoiled me. Making changes and seeing them instantly was addictive. Android's build times are longer, especially when you're working on a modular architecture like Gojek's. However, the team has optimized their build process significantly, and the stability you get from native development often makes up for the slower iteration cycle.

### Platform Integration

With Flutter, platform channels always felt like a necessary evil - a way to access native functionality when you absolutely had to. In native Android, you have direct access to everything. Want to integrate with the system's notification system, handle background services, or optimize battery usage? You can do it directly without jumping through hoops.

At Gojek, this direct platform access is crucial. The driver apps need to handle GPS tracking, real-time navigation, background location updates, and push notifications simultaneously. While this is possible with Flutter, native Android gives you more precise control over these system-level interactions.

### Debugging and Performance Analysis

Android Studio's debugging tools are incredibly powerful compared to what I was used to in Flutter development. The ability to inspect memory usage, analyze CPU performance, and debug threading issues in real-time has made me a better developer overall.

## What I've Learned About Transitioning Technologies

### Don't Throw Away Your Previous Knowledge

The biggest mistake I could have made was thinking that my Flutter experience was irrelevant. Mobile development concepts like user experience design, API integration, state management principles, and testing strategies transfer directly. The syntax changes, but the fundamental problems remain the same.

### Embrace the Learning Curve

Native Android development has a steeper learning curve than Flutter, especially when you're working at Gojek's scale. But this complexity exists for good reasons. The additional control and flexibility become invaluable when you're building apps that need to handle edge cases and performance requirements that simpler frameworks can't address.

### Focus on Fundamentals

Understanding Android's fundamental concepts - the Activity lifecycle, memory management, threading, and the component system - is more valuable than memorizing specific APIs. These concepts don't change much over time, while specific libraries and frameworks come and go.

## The Bigger Picture: Why This Transition Matters

Working at Gojek has shown me that technology choices aren't just about developer preference - they're about business requirements, scale, and long-term maintainability. Flutter is excellent for rapid prototyping and cross-platform development, but when you're building the infrastructure that powers an entire country's economy, native development often makes more sense.

The driver apps I'm now working on affect the livelihoods of over 2 million drivers across Southeast Asia. This level of responsibility requires a different approach to software development than I was used to in my previous roles.

## Practical Advice for Other Flutter Developers Making the Switch

### Start with the Fundamentals

Don't jump straight into complex architectural patterns. Spend time understanding Activities, Fragments, and the Android component model. Build simple apps that demonstrate these concepts before moving to more advanced topics.

### Leverage Your Existing Skills

Your understanding of mobile UX, API integration, and testing principles from Flutter development is valuable. Focus on learning how to implement these familiar concepts in Android rather than learning completely new approaches.

### Embrace the Tooling

Android Studio is incredibly powerful, but it has a learning curve. Spend time learning the debugging tools, profilers, and testing frameworks. These tools will make you significantly more productive once you master them.

### Find a Mentor

Having someone experienced guide you through the transition makes a huge difference. At Gojek, the senior engineers have been incredibly helpful in explaining not just how to do things, but why certain approaches work better at scale.

## Looking Forward: What's Next in My Journey

Three weeks into this transition, I'm starting to appreciate the power and flexibility of native Android development. The learning curve is steep, but I can see how this knowledge will make me a more well-rounded mobile developer.

Gojek's engineering culture emphasizes continuous learning and growth. The company believes that "failing is learning" and that if we're not failing, we're not doing it right. This mindset has made the transition less stressful and more exciting.

My next goals are to contribute meaningfully to the driver app codebase and eventually understand enough about the architecture to help onboard other developers making similar transitions. The documentation and roadmap I'm creating will hopefully make this journey easier for the next person who joins the team.

## Final Thoughts: The Human Side of Technical Transitions

Making this transition from Flutter to Android native hasn't just been about learning new APIs or understanding different architectural patterns. It's been about adapting to a new way of thinking about software development.

At Gojek, every technical decision impacts millions of people. This level of responsibility changes how you approach problem-solving, code quality, and system design. While Flutter gave me the confidence to build mobile apps quickly, Android native development is teaching me how to build them sustainably and at scale.

The journey is far from over, but I'm grateful for the opportunity to grow as a developer while working on technology that genuinely makes people's lives better. That's what makes this transition worthwhile - not just the technical skills I'm gaining, but the impact those skills can have when applied thoughtfully and at scale.

For anyone else considering a similar transition, my advice is simple: embrace the challenge, leverage your existing knowledge, and remember that every expert was once a beginner. The learning curve might be steep, but the view from the top is worth it.

![Gojek Gif](https://substackcdn.com/image/fetch/$s_!SVpT!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5faaec5c-426f-4db1-84f6-309362c6bf51_1000x527.gif)

Thanks for reading, I hope this gave you some insight into what it's like transitioning from cross-platform to native development at scale. The journey has only just begun, and I'm excited to keep sharing what I learn along the way.

See you again soon with a new topic! 👋