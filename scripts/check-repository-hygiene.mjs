import { execFileSync } from "node:child_process"

let files
try {
  files = execFileSync(
    "git",
    ["ls-files", "--cached", "--ignored", "--exclude-standard", "-z"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).split("\0").filter(Boolean)
} catch {
  console.error("Não foi possível verificar o índice do Git.")
  process.exit(1)
}

if (files.length > 0) {
  console.error("Arquivos ignorados não podem ser versionados:")
  for (const file of files) console.error(`- ${JSON.stringify(file)}`)
  console.error("Remova-os do índice com git rm --cached, preservando a cópia local.")
  process.exit(1)
}

console.log("Higiene do repositório: nenhum arquivo ignorado está versionado.")
