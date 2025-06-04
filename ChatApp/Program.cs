using System.Text.Json.Nodes;
using System.Text.Json;
using System.Threading.Tasks;
using System.Text;
using System.Net.Http.Headers;

class Program
{
    private static string API_KEY = "KEY";
    private static string URL_API_OPENAI = "https://api.openai.com/v1/chat/completions";

    static async Task Main(string[] args)
    {
        await UseCase_ObterHorarioAtualViaOpenAI();
    }

    // ========================================================
    // ✅ Use Case 1: Obter horário atual (via função local)
    // ========================================================
    private static async Task UseCase_ObterHorarioAtualViaOpenAI()
    {
        var URL_API_OPENAI = "https://api.openai.com/v1/chat/completions";

        var context = new JsonArray
        {
            new JsonObject { ["role"] = "system", ["content"] = "Você informa o horário atual quando solicitado." },
            new JsonObject { ["role"] = "user", ["content"] = "Qual é o horário agora?" }
        };

        var tools = new[] {
            new {
                name = "getTimeOfDay",
                description = "Return the current time",
                parameters = new { type = "object", properties = new {}}
            }
        };

        var resultadoChamada = await CallOpenApi(context, tools, "gpt-3.5-turbo");
        var doc = JsonDocument.Parse(resultadoChamada);
        var choice = doc.RootElement.GetProperty("choices")[0];

        if (choice.GetProperty("finish_reason").ToString() == "function_call")
        {
            var fn = choice.GetProperty("message").GetProperty("function_call");
            string result = GetTimeOfDay();

            context.Add(new JsonObject
            {
                ["role"] = "assistant",
                ["function_call"] = fn
            });

            context.Add(new JsonObject
            {
                ["role"] = "function",
                ["name"] = fn.GetProperty("name").ToString(),
                ["content"] = result
            });

            var secondResult = await CallOpenApi(context, [], "gpt-3.5-turbo-0613");
            var final = JsonDocument.Parse(secondResult);
            var contentResult = final.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").ToString();

            Console.WriteLine("Resposta final: " + contentResult);
        }
        else
        {
            string contentResult = choice.GetProperty("message").GetProperty("content").ToString();
            Console.WriteLine("Resposta direta: " + contentResult);
        }
    }

    // ========================================================
    // ✅ Use Case 2: Obter status de pedido (via função local)
    // ========================================================
    private async Task UseCase_ObterStatusDoPedidoViaOpenAI(string orderId)
    {
        var context = new JsonArray
        {
            new JsonObject { ["role"] = "system", ["content"] = "You responde the order status"},
            new JsonObject { ["role"] = "user", ["content"] = $"What is the status of the order {orderId}?" }
        };

        var tools = new[] {
            new {
                name = "getOrderStatus",
                description = "Retorna o status de um pedido",
                parameters = new {
                    type = "object",
                    properties = new {
                        orderId = new { type = "string", description = "ID do pedido"}
                    },
                    required = new [] { "orderId" }
                }
            }
        };

        var response = await CallOpenApi(context, tools, "gpt-3.5-turbo-0613");
        if (response.ShouldCallFunction)
        {
            var resultOrderStatus = GetOrderStatus(response.Arguments);
            context.Add(new JsonObject
            {
                ["role"] = "assistant",
                ["function_call"] = resultOrderStatus.RawFunction
            });

            context.Add(new JsonObject
            {
                ["role"] = "function",
                ["name"] = resultOrderStatus.FunctionName,
                ["content"] = resultOrderStatus
            });

            var responseCallOpenApiOrder = await CallOpenApi(context, tools, "gpt-3.5-turbo-0613");
            var doc = JsonDocument.Parse(responseCallOpenApiOrder);
            var finalMessage = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content");
            Console.WriteLine("Resposta final: " + finalMessage);
        }
    }

    private static async Task<dynamic> CallOpenApi(JsonArray context, object[] tools, string model)
    {
        var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", API_KEY);

        var request = new
        {
            model,
            messages = context,
            functions = tools,
            function_call = "auto"
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await httpClient.PostAsync(URL_API_OPENAI, content);
        var result = await response.Content.ReadAsStringAsync();

        return result;
    }

    private static string GetTimeOfDay()
    {
        return DateTime.Now.ToString("HH:mm");
    }

    private string GetOrderStatus(string orderId)
    {
        int id = int.Parse(orderId);
        return (id % 2 == 0) ? "IN_PROGRESS" : "COMPLETED";
    }

}

