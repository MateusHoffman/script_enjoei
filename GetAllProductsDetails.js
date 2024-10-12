import { readFile } from "fs/promises";
import fs from "fs";
import pLimit from "p-limit";

// Função para ler os produtos do arquivo
const getProductsFromFile = async () => {
  try {
    const data = await readFile("productsSold.json", "utf8");
    const products = JSON.parse(data); // Converte a string JSON para array de objetos
    console.log(`Arquivo carregado com sucesso: ${products.length} produtos.`);
    return products;
  } catch (error) {
    console.error("Erro ao ler o arquivo:", error);
    return [];
  }
};

// Função para buscar detalhes do produto
const getProductDetail = async (id) => {
  const headersList = {
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
  };

  try {
    console.log(`Buscando detalhes para o produto ID: ${id}`); // Log antes da chamada
    const response = await fetch(
      `https://pages.enjoei.com.br/products/${id}/v2.json`,
      {
        method: "GET",
        headers: headersList,
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar produto ${id}: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Detalhes do produto ID ${id} obtidos com sucesso.`); // Log após a chamada
    return {
      id: data.id,
      title: data.title,
      url: data.canonical_url,
      description: data.description,
      used: data.used,
      size: data.size,
      initialPrice: data?.fallback_pricing?.price?.listed,
      price: data?.fallback_pricing?.price?.sale,
    };
  } catch (error) {
    console.error(`Erro ao obter detalhes do produto ${id}: ${error.message}`);
    return null; // Retorna null em caso de erro
  }
};

// Função principal
(async () => {
  console.time("Execução Total"); // Log de desempenho

  console.log("Iniciando o processamento..."); // Log inicial

  const products = await getProductsFromFile();
  // const products = productss.slice(0, 100);
  if (products.length === 0) {
    console.log("Nenhum produto para processar.");
    return; // Para se não houver produtos
  }

  let allProducts = [];

  // Limitar a concorrência para evitar sobrecarga
  const limit = pLimit(100); // Ajuste para um número razoável de concorrência

  // Contadores
  let processedCount = 0; // Contador de produtos processados
  const totalCount = products.length; // Total de produtos

  // Criar um array de promessas
  const fetchTasks = products.map((id) =>
    limit(async () => {
      const productDetail = await getProductDetail(id.toString());

      // Incrementa o contador de produtos processados
      processedCount++;

      // Loga o progresso
      console.log(
        `Processado ${processedCount}/${totalCount} produtos. ${
          totalCount - processedCount
        } restantes.`
      );

      return productDetail; // Retorna produtos vendidos para cada vendedor
    })
  );

  // Aguarda todas as requisições terminarem e processa os resultados
  const results = await Promise.all(fetchTasks);

  // Processar os resultados e coletar produtos vendidos
  results.forEach((result) => {
    if (result) {
      allProducts.push(result); // Adiciona diretamente o objeto
    }
  });

  console.log("Total de produtos vendidos:", allProducts.length);
  fs.writeFileSync(
    "productsDetails.json",
    JSON.stringify(allProducts, null, 2)
  );

  console.timeEnd("Execução Total"); // Log do tempo total de execução
})();
