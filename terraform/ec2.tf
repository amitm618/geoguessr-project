resource "aws_instance" "geoguessr" {
  ami           = "ami-0914547665e6a707c" # Ubuntu 22.04 LTS in eu-north-1
  instance_type = "t3.micro"

  key_name = "geoguessr-key" 

  vpc_security_group_ids = [aws_security_group.geoguessr_sg.id]

  user_data = file("setup.sh")

  tags = {
    Name = "geoguessr-instance"
  }
}

resource "aws_security_group" "geoguessr_sg" {
  name        = "geoguessr-sg"
  description = "Allow SSH and HTTP access"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # SSH
  }
 
  ingress {
  from_port   = 3000
  to_port     = 3000
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"] # Allow React frontend
}


  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # HTTP
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # HTTPS
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
