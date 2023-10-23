pipeline {
    agent any
  	options {
        // This is required if you want to clean before build
        skipDefaultCheckout(true)
    }
    stages {
      	stage('Cleanup') {
            steps {
                // Clean before build
                cleanWs()
                // We need to explicitly checkout from SCM here
                checkout scm
                echo "Building ${env.JOB_NAME}..."
            }
        }
		stage('Build') {
			when { anyOf { branch 'master'; tag 'rc-v*'; tag 'v*'} }
            agent {
                docker {
                    image 'node:16.14.2'
                    reuseNode true
                    args '-v /etc/passwd:/etc/passwd:ro -v /etc/group:/etc/group:ro -v /etc/shadow:/etc/shadow:ro'
                }
            }
            steps {   
                script {
                    sshagent(['ssh-key-global']) {
                        sh 'npm cache clean -f --cache="$WORKSPACE/.npm"'
                        sh 'rm -rf node_modules package-lock.json'
                        sh 'GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" npm install --cache="$WORKSPACE/.npm"'
                    }
                }
            }
        }
        stage('Packaging') {
			when { anyOf { branch 'master'; tag 'rc-v*'; tag 'v*'} }
            steps {
                script {
                    sh 'rm -f -r yt-search.zip node_modules .npm'
                    sh 'zip -q -r yt-search.zip . -x yt-search.zip -x node_modules/* -x .npm/* -x .git/*'    
                }
            }
        }
		stage('Deploy to Production ENV') {
            when {
                branch "master"
            }
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: "xlscout-api-dev-soscip",  keyFileVariable: 'sshKey', usernameVariable: 'sshUser', passphraseVariable: '')]) {
						sh 'scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -P 6000 -i $sshKey yt-search.zip $sshUser@34.168.79.98:~/yt-search.zip'
                        sh 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -p 6000 -i $sshKey $sshUser@34.168.79.98 "mkdir -p /www/bkp/yt-search && cp ~/yt-search.zip /www/bkp/yt-search/yt-search-$(date +%F-%T).zip && unzip -qq -o ~/yt-search.zip -d /www/yt-search && cd /www/yt-search && npm install && npm run build && pm2 restart yt-search"'
                    }
				}
			}
		}
	}
} 
