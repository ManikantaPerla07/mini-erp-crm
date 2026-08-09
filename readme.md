# Mini ERP + CRM Operations Portal

A full-stack ERP + CRM operations portal developed as part of the **Full Stack Developer Case Study** for a wholesale/distribution business.

The application provides a centralized system for managing customers, products, inventory, stock movements, sales challans, CRM follow-ups, reporting, authentication, and role-based access.

The project demonstrates practical full-stack development across:

- Frontend application development
- REST API design
- PostgreSQL database design
- Authentication and authorization
- Business logic and inventory management
- Input validation and error handling
- Responsive admin-style UI
- Cloud deployment
- Environment-based configuration
- Git-based development workflow


## Table of Contents

- [Project Overview](#project-overview)
- [Business Context](#business-context)
- [Live Application](#live-application)
- [Repository](#repository)
- [Screenshots](#screenshots)
- [Core Features](#core-features)
- [Authentication and Roles](#authentication-and-roles)
- [Customer CRM Module](#customer-crm-module)
- [Product Management](#product-management)
- [Inventory Management](#inventory-management)
- [Sales Challan Module](#sales-challan-module)
- [CRM Follow-ups](#crm-follow-ups)
- [Reports and Dashboard](#reports-and-dashboard)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Architecture Diagram](#architecture-diagram)
- [Application Flow](#application-flow)
- [Database](#database)
- [API Design](#api-design)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
- [Server Setup](#server-setup)
- [Deployment Configuration](#deployment-configuration)
- [Testing and Verification](#testing-and-verification)
- [Test Credentials](#test-credentials)
- [Postman / API Documentation](#postman--api-documentation)
- [Project Structure](#project-structure)
- [Business Rules](#business-rules)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Case Study Requirement Coverage](#case-study-requirement-coverage)
- [Contributing](#contributing)
- [Author](#author)


---

# Project Overview

Mini ERP + CRM is a web-based business operations portal designed for a wholesale/distribution company.

The system provides a unified interface for internal business teams to manage:

- Customers
- Products
- Inventory
- Stock movements
- Sales challans
- Customer follow-ups
- Operational reports
- User authentication
- Role-based access

The goal of the project is to demonstrate a practical full-stack application rather than an oversized enterprise ERP system.


# Business Context

The application is designed around a wholesale/distribution business where internal employees such as:

- Sales
- Warehouse
- Accounts
- Administrators

need access to shared operational information.

The system connects customer management, product management, inventory operations, sales challans, and CRM follow-ups into a single application.

This allows the organization to maintain a consistent flow from:

```text
Customer
   ↓
Product Selection
   ↓
Sales Challan
   ↓
Inventory Update
   ↓
CRM Follow-up
   ↓
Reports