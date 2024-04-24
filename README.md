# DVAPI Damn Vulnerable API

![](images/logo.png)

## About DVAPI ?

Welcome to the Damn Vulnerable API ( DVAPI ) project. This project is based on the OWASP API Top 10 2023 Stable version which is published on June 5th 2023. This lab is designed to help you learn about and explore the top 10 security risks associated with APIs according to the OWASP API Security Project.

The OWASP API Top 10 - 2023 consists of the following vulnerabilities:
-	0xa1: Broken Object Level Authorization
-	0xa2: Broken Authentication
-	0xa3: Broken Object Property Level Authorization
-	0xa4: Unrestricted Resource Consumption
-	0xa5: Broken Function Level Authorization
-	0xa6: Unrestricted Access to Sensitive Business Flows
-	0xa7: Server Side Request Forgery
-	0xa8: Security Misconfiguration
-	0xa9: Improper Inventory Management
-	0xaa: Unsafe Consumption of APIs

## Who can use DVAPI?

DVAPI is designed for a diverse range of users:

- **API enthusiasts**: Whether you're a beginner or have intermediate knowledge, DVAPI offers a hands-on learning experience to explore API vulnerabilities and enhance your skills.
- **Security professionals**: Stay up to date with the latest API security trends and the OWASP API Top 10 - 2023 RC. DVAPI allows security professionals to practice identifying API-related risks.
- **Developers**: Developers can learn about potential security pitfalls and adopt best practices to protect their own APIs from common vulnerabilities. DVAPI serves as an educational tool for developers looking to enhance their API security knowledge.
- **Educators and trainers**: DVAPI provides a comprehensive platform for teaching API security, allowing instructors to engage students in discovering vulnerabilities and applying countermeasures.

DVAPI caters to individuals seeking practical knowledge and a deeper understanding of API security, regardless of their background or expertise.

# Get Started

## Features

The DVAPI lab provides a series of challenges and exercises related to the top 10 API security risks identified by OWASP. These challenges are designed to test your knowledge and skills in identifying and mitigating common security vulnerabilities in API implementations.

The DVPI application is built as a CTF application that itself is vulnerable. Users can identify and exploit the vulnerabilities, obtain the flags and submit into the application.

It has many functionalities that uses different API endpoints. We have added a Postman collection file that you can import. The DVAPI application has a swagger endpoint as well, which you can use.

All in all, users have the flexibility to assess the APIs via these methods:
- The application itself
- Postman collection
    - Get the Postman collection on [DVAPI.postman_collection.json](src/swagger/DVAPI.postman_collection.json)
    - You can also fork the collection from our public Postman workspace at [https://www.postman.com/payatu/workspace/dvapi](https://www.postman.com/payatu/workspace/dvapi)
- Swagger API endpoint (accessible at the `/Swagger` endpoint on the DVAPI lab)

## Setting up DVAPI

To get started with the DVAPI lab, follow the steps below:

1.  **Clone the repository:**

```bash
git clone https://github.com/payatu/DVAPI.git
```

2.  Navigate to the DVAPI directory:.

```bash
cd DVAPI
```

3.  Use `docker compose` to build and run the application:

```bash
docker compose up --build
```

4.  Access the DVAPI application at [http://127.0.0.1:3000](http://127.0.0.1:3000/)

![](images/dvapi.png)

**Disclaimer: As this application is intentionally vulnerable, do not host this on a production environment.** 

# Upcoming/Past Sessions

Our team has presented DVAPI in [Bsides Bangalore 2023 ToolsForge](https://bsidesbangalore.in/) on 8th June 2023.

# Feedback & Bug Reports

If you have any feedback or find any bugs in the app, please feel free to open an issue on this repository.

# Core Team

### Bandit Manash (developer)
- [linkedin](https://www.linkedin.com/in/manash-saikia)
- [@manash036](https://twitter.com/manash036)

### Bandit Samuel (developer)
- [linkedin](https://www.linkedin.com/in/samuel-valmiki-6a39371a8)
- [@sign3tsh3l1](https://twitter.com/sign3tsh3l1)

### Suraj Kumar (project lead)
- [linkedin](https://www.linkedin.com/in/surajkum4r)
- [@surajkum4r](https://twitter.com/surajkum4r)

# About Payatu

[Payatu](https://payatu.com/) is a leading cybersecurity firm in India, offering a comprehensive range of services to enhance organizational security. Their expertise includes security consulting, training, and research. Payatu's security consulting services encompass thorough assessments, penetration testing, and code reviews, providing actionable recommendations to address vulnerabilities effectively. They specialize in delivering training programs that cover diverse cybersecurity aspects, fostering a strong security mindset among professionals. Additionally, Payatu excels in IoT security and embedded systems security, helping organizations secure interconnected devices and systems with their in-depth knowledge. Their active research and development efforts contribute to the cybersecurity community by exploring vulnerabilities, exploits, and emerging technologies.

With a diverse client base across industries like healthcare, finance, automotive, and manufacturing, Payatu is renowned for its technical expertise, professionalism, and commitment to delivering high-quality security services. Their holistic approach helps organizations identify and mitigate risks, establish robust security measures, and safeguard valuable assets effectively.
