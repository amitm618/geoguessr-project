provider "aws" {
  region = "eu-north-1" # You can change to your AWS region
}
output "instance_ip" {
  value       = aws_instance.geoguessr.public_ip
  description = "Public IP of the EC2 instance"
}
