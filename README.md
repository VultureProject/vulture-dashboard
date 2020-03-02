# Vulture Dashboard

## Introduction

Dashboard for the Web Application Firewall Vulture and Darwin.

Interact with VultureOS through Redis channels.

## How it works

Vulture and Darwin push messages to a Redis channels. This app subscribe to those channels and render data in the dashboard.