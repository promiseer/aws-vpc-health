variable "aws_region" {
  type        = string
  description = "Region for the demo. ap-south-1 matches the rest of my AWS work."
  default     = "ap-south-1"
}

variable "project_name" {
  type        = string
  description = "Prefix for resource names."
  default     = "vpc-health"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR for the VPC. Two /24 public subnets are cut from this."
  default     = "10.42.0.0/16"
}

variable "instance_type" {
  type        = string
  description = "Size of the single demo instance."
  default     = "t3.micro"
}

variable "allowed_http_cidrs" {
  type        = list(string)
  description = "Who can open port 80. Replace the default with your IP /32 if the stack stays up."
  default     = ["0.0.0.0/0"]

  validation {
    condition     = length(var.allowed_http_cidrs) > 0
    error_message = "Allow at least one CIDR on port 80."
  }
}
