# Operação do endpoint de contato

## Objetivo e escopo

Este guia descreve a operação de `POST /api/contact` nos runtimes Node.js da Vercel e do servidor standalone. Ele cobre rate limiting, confiança de proxy, timeout e idempotência. A rota não substitui WAF, fila durável ou monitoramento do provedor.

## Pré-requisitos

- Configure as variáveis obrigatórias validadas pelo bootstrap de produção.
- Defina `CONTACT_TRUST_PROXY` de acordo com a topologia real.
- Garanta que o proxy confiável remova o header de IP recebido do cliente antes de escrever o header configurado.
- Nunca registre payload, email, chave de idempotência ou credenciais.

## Rate limiting

A admissão consulta o bucket do cliente e o bucket global antes de alterar o estado. Uma tentativa é contabilizada nos dois buckets somente quando ambos têm capacidade. Requisições rejeitadas por um bucket não consomem o outro.

O estado permanece em memória por processo. Reinícios descartam contadores e réplicas não compartilham estado. Antes de aumentar limites ou adicionar infraestrutura, confirme no ambiente:

1. quantidade e duração das réplicas;
2. valor efetivo de `CONTACT_TRUST_PROXY` e header escrito pela borda;
3. regras de rate limiting e bloqueio já ativas no WAF;
4. volume legítimo e padrões de abuso observados sem coletar conteúdo do formulário.

Com `CONTACT_TRUST_PROXY=false`, todos os visitantes usam um identificador compartilhado. Essa configuração evita confiar em headers falsificáveis, mas também compartilha o limite chamado de cliente. Com `CONTACT_TRUST_PROXY=true`, o endereço selecionado da cadeia confiável é transformado em HMAC antes de entrar no mapa.

## Timeout, retentativa e idempotência

O timeout limita quanto a rota aguarda a resposta do Resend. Ele não cancela a operação já iniciada e uma resposta `504` significa que o resultado ficou indeterminado.

O formulário cria uma chave opaca, guarda somente chave e timestamp em `sessionStorage` por até 23 horas e a envia em `Idempotency-Key`. Reloads, retentativas e edições reutilizam essa chave até o primeiro sucesso; como a API vincula chave e payload por HMAC, payloads diferentes ainda produzem digests diferentes no provider. A rota aceita de 16 a 128 caracteres alfanuméricos, sublinhado ou hífen; um header presente e malformado recebe `400` sem consumir rate limit. Depois do sucesso, o formulário remove a chave. Clientes antigos sem o header continuam aceitos e mantêm a deduplicação temporal de dez minutos; uma retentativa exatamente na troca dessa janela pode gerar outra chave.

Não há retentativa automática: após `504`, o erro permanece visível e o usuário decide quando tentar novamente. Essa política evita uma segunda chamada silenciosa enquanto a primeira ainda pode concluir. A deduplicação final depende da janela e das garantias do Resend; portanto, timeout nunca deve ser exibido como confirmação de falha definitiva. O provedor [documenta uma janela de idempotência de 24 horas](https://resend.com/docs/dashboard/emails/idempotency-keys); o cliente usa 23 horas para não operar no limite dessa garantia. Depois disso, uma nova entrega pode ocorrer.

O formulário usa `/api/contact` na mesma origem. `CONTACT_ALLOWED_ORIGINS` valida requests que trazem `Origin`, mas não ativa CORS: a rota não implementa `OPTIONS` nem responde com `Access-Control-Allow-*`. Integrações em outro domínio devem usar um backend próprio ou passar por uma decisão explícita de contrato e segurança.

## Privacidade e retenção

O formulário encaminha nome, email, empresa opcional, assunto e mensagem ao Resend e à caixa configurada. O site não mantém banco próprio dessas mensagens e os logs da aplicação evitam o payload. Isso não define a retenção nos serviços externos.

Antes da aprovação operacional, o responsável deve confirmar e registrar:

1. prazo ou critério de retenção na caixa de email;
2. retenção configurada no Resend e nos logs da Vercel ou do runtime standalone;
3. pessoas com acesso;
4. procedimento para localizar, corrigir ou excluir uma conversa.

A página localizada de privacidade deve refletir esses valores quando forem decididos. Até lá, ela só pode descrever que a retenção depende da finalidade da conversa e das configurações dos serviços.

## Como validar

Use somente provider simulado:

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH npm exec vitest run src/app/api/contact/route.test.ts
```

Os testes devem confirmar:

- isolamento entre clientes quando IPs confiáveis estão habilitados;
- nenhuma capacidade global consumida por tentativas já bloqueadas;
- mesma chave do provider para a mesma combinação de payload e chave de retentativa;
- chaves diferentes quando o payload muda;
- respostas sem cache e sem conteúdo sensível.

Para validar a interface, intercepte `/api/contact` e devolva `504`; não permita uma chamada real ao provider. Confirme que o alerta continua visível e que uma nova submissão do mesmo payload reutiliza `Idempotency-Key`.

## Limitações conhecidas

- Não existe rate limit distribuído ou fila durável neste repositório.
- O estado de WAF e as variáveis efetivas precisam ser verificados na plataforma.
- Uma operação pode concluir no provider depois do timeout local.
- A entrega, retenção e janela de idempotência do Resend são controles externos.
- Se `sessionStorage` estiver bloqueado ou cheio, a chave existe apenas em memória e não sobrevive a reload.
- A allowlist de origem não oferece CORS para aplicações hospedadas em outro domínio.
