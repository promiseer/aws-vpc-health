output "app_url" {
  description = "Home page. On EC2 this includes the instance id from IMDSv2."
  value       = "http://${aws_instance.app.public_ip}/"
}

output "health_url" {
  value = "http://${aws_instance.app.public_ip}/health"
}

output "instance_id" {
  value = aws_instance.app.id
}

output "ssm_session" {
  value = "aws ssm start-session --target ${aws_instance.app.id} --region ${var.aws_region}"
}

output "log_group" {
  value = aws_cloudwatch_log_group.app.name
}

output "cost_note" {
  value = "A public IPv4 is billed per hour. Run terraform destroy in infra/ when you finish looking."
}
