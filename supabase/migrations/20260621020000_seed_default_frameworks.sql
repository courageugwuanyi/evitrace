DELETE FROM public.competency_frameworks 
WHERE name = 'Company Custom 11-Dimension Reference Guide';

INSERT INTO public.competency_frameworks (name, description, is_system_default, matrix)
VALUES 
(
    'Company Custom 11-Dimension Reference Guide',
    'Verbatim corporate competencies tracking 11 distinct performance indicators required for promotion packets.',
    true,
    '{
      "company_format": true,
      "effectiveness_scale": {
        "1": "Limited Effectiveness",
        "2": "Somewhat Effective",
        "3": "Fully Effective",
        "4": "Highly Effective",
        "5": "Extremely Effective"
      },
      "categories": {
        "Analytical Thinking": {
          "summary": "Analysing and synthesising information to understand issues, identify options, and support sound decision making.",
          "items": [
            "Analyses complex situations, breaking each into its constituent parts.",
            "Evaluates alternative causes or ways of interpreting complex information.",
            "Identifies connections between situations that are not obviously related.",
            "Identifies gaps in information and makes assumptions in order to continue the analysis and/or take action."
          ]
        },
        "Communication": {
          "summary": "Listening and communicating openly, honestly, and respectfully with different audiences, promoting dialogue and building consensus.",
          "items": [
            "Tailors communication (e.g. content, style and medium) to diverse audiences.",
            "Reads cues from diverse listeners to assess when and how to change planned communication approach to effectively deliver message.",
            "Communicates with all organizational levels.",
            "Understands others'' complex or underlying needs, motivations, emotions or concerns, communicating effectively despite the sensitivity of the situation."
          ]
        },
        "Teamwork": {
          "summary": "Working collaboratively with others to achieve organizational goals.",
          "items": [
            "Initiates collaboration with others.",
            "Assumes additional responsibilities to facilitate the achievement of team goals.",
            "Seeks input from other team members on matters that affect them."
          ]
        },
        "Languages and Frameworks": {
          "summary": "Understanding and writing code, using and designing libraries to write and maintain software.",
          "items": [
            "Fluent in one or more language''s syntax, knows how to find new libraries to solve problems or create their own. Seeks to write idiomatic code.",
            "Coaches a junior or an intern to basic productivity. Knows where the docs are and how to use them.",
            "Explains how code in a given language is actually compiled/interpreted/executed and how memory is managed (or not) by the language runtime.",
            "Identify code smells and suggest ways of improving the code.",
            "Contributes to the choice of libraries used.",
            "Applies good security practises when writing code.",
            "Proactively looks for security vulnerabilities and can practice responsible disclosure."
          ]
        },
        "Engineering Quality": {
          "summary": "Ensuring that units of code meet expected quality and can be maintained in the future through testing.",
          "items": [
            "Monitors for inconsistent test results as new features are being developed.",
            "Improves test coverage through adding unit, integration and functional test scripts.",
            "Collaborates and contributes to acceptance criteria during user story creation and review.",
            "Writes testable code and adds unit and integration tests for new and modified code.",
            "Applies testing tools and frameworks relevant to technology and environments.",
            "Identifies test scenarios and creates automated test scripts to verify the application''s functionality.",
            "Maintains automated test suites and tracks outcomes."
          ]
        },
        "Build and Deployment": {
          "summary": "Building and packaging up software to deploy into an environment.",
          "items": [
            "Configure a basic build in Continuous Integration.",
            "Generates builds and deploying them to different environments.",
            "Modify existing builds of varying complexity.",
            "Write a simple build from scratch in a new build tool."
          ]
        },
        "Engineering for User Experience": {
          "summary": "Building products, services and systems that are easy to use, efficient and provide value to users.",
          "items": [
            "Familiarity with most of the UX personas for the software application or service and how they interact with it.",
            "Explains how good UX can add value to a product/service.",
            "Understands multiple ways in which software design decisions impact user experience, including UI and API.",
            "Provides examples where UX has been considered within software.",
            "Improve the quality of the product or service through collaboration with UX.",
            "Implements features using Design Systems and seeks help when required components do not exist."
          ]
        },
        "Data Management": {
          "summary": "Developing and maintaining data and its management for a product, service or organization.",
          "items": [
            "Understands the pros/cons of several data representations/formats and the libraries that support them.",
            "Works with RDBMS directly and via programming interface.",
            "Involved in the development, deployment or use of one or more components in production environments.",
            "Understands regulations such as GDPR, Data Protection, Privacy and their constraints on projects/products/services.",
            "Explains in detail the full data lifecycle of a product they work on."
          ]
        },
        "Software Tooling": {
          "summary": "Using tools and processes to write software in collaboration with others.",
          "items": [
            "Automates tasks (Infrastructure as Code, build, test, deploy, monitor etc.) through appropriate tooling and scripting.",
            "Documents the usage of tools in products whenever necessary.",
            "Competent with the majority of tools used in the team to contribute to development, maintenance and improvement of software products.",
            "Describes why the team picked certain tools (and not others) for development."
          ]
        },
        "Organization and Patterns": {
          "summary": "Designing, understanding and communicating about systems from modules, libraries and other systems.",
          "items": [
            "Identifies common problems with concurrent programming and avoids them.",
            "Knowledge of what design patterns are and how they are utilised.",
            "Experience in using OOP/Functional Programming to design and produce code.",
            "Determines when to make an application stateful or stateless.",
            "Applies the principles behind big-O notation and the trade-offs made in different algorithms.",
            "Determines solutions to resolve issues blocking progress where appropriate.",
            "Refactors a unit of code (class or file) to be more easily understood and reused."
          ]
        },
        "Environments": {
          "summary": "An appreciation of where software meets other software, designing for real world applications and data persistence.",
          "items": [
            "Develops applications that will work in multiple environments.",
            "Determines how and when to test products in different environments to maintain performance.",
            "Utilises datastores within an existing codebase effectively, understanding costs of storage and retrieval operations.",
            "Resolves issues within distributed systems.",
            "Utilises knowledge of security vulnerabilities such as SQL injection and XSS to avoid creating vulnerabilities in an application."
          ]
        }
      }
    }'::jsonb
);