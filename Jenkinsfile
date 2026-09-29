pipeline {
    agent any

    stages {
        stage('Environment') {
            steps {
                bat 'node --version'
                bat 'call npm --version'
                bat 'java -version'
            }
        }

        stage('Syntax Check') {
            steps {
                bat 'node --check server.js'
                bat 'node --check test.js'
                bat 'node --check public\\script.js'
            }
        }

        stage('Automated Tests') {
            steps {
                bat 'call npm test'
            }
        }
    }
}