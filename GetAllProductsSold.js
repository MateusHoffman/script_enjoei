import { readFile } from "fs/promises";
import fs from "fs";
import pLimit from "p-limit";

// Função sleep que faz o código "esperar" um tempo
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Log de performance para medir tempo
console.time("Execução Total");

const getProductsFromFile = async () => {
  try {
    const data = await readFile("products.json", "utf8");
    const products = JSON.parse(data); // Converte a string JSON para array de objetos
    console.log(`Arquivo carregado com sucesso: ${products.length} produtos.`);
    return products;
  } catch (error) {
    console.error("Erro ao ler o arquivo:", error);
    return [];
  }
};

const filterUniqueStores = (array) => {
  const seenStores = new Set();
  const uniqueStores = array.filter((item) => {
    if (!seenStores.has(item.store)) {
      seenStores.add(item.store);
      return true; // Mantém o item no array
    }
    return false; // Filtra o item duplicado
  });

  console.log(`Total de lojas únicas filtradas: ${uniqueStores.length}`);
  return uniqueStores;
};

// Função que faz a requisição dos produtos vendidos de cada vendedor
const getAllProductsAlreadySoldByTheSeller = async (seller) => {
  let allProducts = [];
  let page = 1;
  let retries = 0;

  while (true) {
    console.log(`Vendedor ${seller}, Página: ${page}`);
    let headersList = {
      "User-Agent": "PerformanceOptimizedScript/1.0",
    };

    try {
      let response = await fetch(
        `https://www.enjoei.com.br/api/v5/users/${seller.slice(
          1
        )}/products/sold?page=${page}`,
        {
          method: "GET",
          headers: headersList,
        }
      );

      if (!response.ok) {
        console.error(
          `Erro ao buscar dados para o vendedor ${seller}: ${response.status}`
        );
        retries++;
        if (retries >= 2) {
          console.log(`Pulando vendedor ${seller} após ${retries} tentativas.`);
          return allProducts; // Retorna os produtos coletados até agora
        }
        await sleep(120000); // Aguarda 2 minutos antes de tentar novamente
        continue;
      }

      let data = await response.json();

      // Verifica se o formato da resposta está correto
      if (!data.products) {
        retries++;
        console.error(`Resposta inesperada para o vendedor ${seller}.`);
        if (retries >= 2) {
          console.log(`Pulando vendedor ${seller} após ${retries} tentativas.`);
          return allProducts;
        }
        await sleep(120000); // Aguarda 2 minutos antes de tentar novamente
        continue;
      }

      allProducts = [...allProducts, ...data.products.map((e) => e.id)];

      // Verifica se há próxima página
      if (data.pagination.next_page === null) {
        break; // Sai do loop quando não houver mais páginas
      }

      // Atualiza a página para a próxima
      page = data.pagination.next_page;
    } catch (error) {
      retries++;
      console.error(`Erro ao buscar produtos do vendedor ${seller}:`, error);
      if (retries >= 2) {
        console.log(`Pulando vendedor ${seller} após ${retries} tentativas.`);
        return allProducts; // Retorna os produtos coletados até agora
      }
      await sleep(120000); // Aguarda 2 minutos antes de tentar novamente
      continue;
    }
  }

  return allProducts; // Retorna todos os produtos vendidos do vendedor
};

(async () => {
  const products = await getProductsFromFile();
  const filteredByStore = filterUniqueStores(products);
  // const filteredByStore = filteredByStoree.slice(0, 3);
  // console.log('Vendedores filtrados: ', filteredByStore);
  let allProductsSold = [];

  // Limitar a concorrência para evitar sobrecarga (aumente se o servidor suportar mais requisições simultâneas)
  const limit = pLimit(10000);

  // Criar um array de promessas
  const fetchTasks = filteredByStore.map((seller, index) =>
    limit(async () => {
      console.log(
        `Processando vendedor: ${seller.store}, Progresso: ${index + 1}/${
          filteredByStore.length
        }`
      );
      const productsSold = await getAllProductsAlreadySoldByTheSeller(
        seller.store
      );
      return productsSold; // Retorna produtos vendidos para cada vendedor
    })
  );

  // Aguarda todas as requisições terminarem e processa os resultados
  const results = await Promise.allSettled(fetchTasks);

  // Processar os resultados e coletar produtos vendidos
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allProductsSold.push(...result.value);
    } else {
      console.error(`Erro ao processar: ${result.reason}`);
    }
  });

  console.log("Total de produtos vendidos:", allProductsSold.length);
  fs.writeFileSync(
    "productsSold.json",
    JSON.stringify(allProductsSold, null, 2)
  );

  console.timeEnd("Execução Total"); // Log do tempo total de execução
})();
