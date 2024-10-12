import { readFile } from "fs/promises";

// Função para ler os produtos do arquivo
const getProductsFromFile = async () => {
  try {
    const data = await readFile("productsDetails.json", "utf8");
    const products = JSON.parse(data); // Converte a string JSON para array de objetos
    console.log(`Arquivo carregado com sucesso: ${products.length} produtos.`);
    return products;
  } catch (error) {
    console.error("Erro ao ler o arquivo:", error);
    return [];
  }
};

const removeAccents = (str) => {
  const accentsMap = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ç': 'c'
  };
  return str.split('').map(char => accentsMap[char] || char).join('');
};

const countWordFrequencyTitle = (products) => {
  // Função auxiliar para remover acentos
  const removeAccents = (str) => {
    const accentsMap = {
      á: "a",
      à: "a",
      ã: "a",
      â: "a",
      ä: "a",
      é: "e",
      è: "e",
      ê: "e",
      ë: "e",
      í: "i",
      ì: "i",
      î: "i",
      ï: "i",
      ó: "o",
      ò: "o",
      õ: "o",
      ô: "o",
      ö: "o",
      ú: "u",
      ù: "u",
      û: "u",
      ü: "u",
      ç: "c",
    };
    return str
      .split("")
      .map((char) => accentsMap[char] || char)
      .join("");
  };

  // Concatenar todos os títulos
  const allTitles = products.map((product) => product.title).join(" ");

  // Remover caracteres especiais e transformar tudo em minúsculas
  const cleanTitles = removeAccents(allTitles)
    .replace(/[^\w\s]/gi, "")
    .toLowerCase();

  // Dividir a string em palavras
  const words = cleanTitles.split(/\s+/).filter(Boolean); // Filtrar entradas vazias

  // Contar a frequência de cada palavra
  const wordCount = {};
  words.forEach((word) => {
    if (wordCount[word]) {
      wordCount[word]++;
    } else {
      wordCount[word] = 1;
    }
  });

  // Transformar o objeto de contagem em um array de objetos
  const result = Object.entries(wordCount).map(
    ([word, numberTimesWordAppears]) => ({
      word,
      numberTimesWordAppears,
    })
  );

  return result.sort(
    (a, b) => b.numberTimesWordAppears - a.numberTimesWordAppears
  );
};

const countWordFrequencyDescription = (products) => {
  // Função auxiliar para remover acentos
  const removeAccents = (str) => {
    const accentsMap = {
      á: "a",
      à: "a",
      ã: "a",
      â: "a",
      ä: "a",
      é: "e",
      è: "e",
      ê: "e",
      ë: "e",
      í: "i",
      ì: "i",
      î: "i",
      ï: "i",
      ó: "o",
      ò: "o",
      õ: "o",
      ô: "o",
      ö: "o",
      ú: "u",
      ù: "u",
      û: "u",
      ü: "u",
      ç: "c",
    };
    return str
      .split("")
      .map((char) => accentsMap[char] || char)
      .join("");
  };

  // Concatenar todos os títulos
  const allTitles = products.map((product) => product.description).join(" ");

  // Remover caracteres especiais e transformar tudo em minúsculas
  const cleanTitles = removeAccents(allTitles)
    .replace(/[^\w\s]/gi, "")
    .toLowerCase();

  // Dividir a string em palavras
  const words = cleanTitles.split(/\s+/).filter(Boolean); // Filtrar entradas vazias

  // Contar a frequência de cada palavra
  const wordCount = {};
  words.forEach((word) => {
    if (wordCount[word]) {
      wordCount[word]++;
    } else {
      wordCount[word] = 1;
    }
  });

  // Transformar o objeto de contagem em um array de objetos
  const result = Object.entries(wordCount).map(
    ([word, numberTimesWordAppears]) => ({
      word,
      numberTimesWordAppears,
    })
  );

  return result.sort(
    (a, b) => b.numberTimesWordAppears - a.numberTimesWordAppears
  );
};

// Função para filtrar produtos
const filterProducts = (products, keywords) => {
  // Normalizar as palavras-chave
  const normalizedKeywords = keywords.map(word => removeAccents(word).toLowerCase());

  return products.filter(product => {
    // Normalizar título e descrição
    const normalizedTitle = removeAccents(product.title).toLowerCase();
    const normalizedDescription = removeAccents(product.description).toLowerCase();

    // Verificar se todas as palavras-chave estão presentes no título ou na descrição
    return normalizedKeywords.every(keyword => 
      normalizedTitle.includes(keyword) || normalizedDescription.includes(keyword)
    );
  });
};

const countPriceFrequency = (products) => {
  // Cria um objeto para armazenar a frequência de cada preço
  const priceFrequency = {};
  let totalSum = 0;
  let totalCount = 0;

  // Itera sobre cada produto
  products.forEach(product => {
    // Usa o preço (price), ou o preço inicial (initialPrice) se o price não existir
    const price = product.price !== undefined ? product.price : product.initialPrice;

    // Calcula a soma total e o número de produtos para a média
    totalSum += price;
    totalCount++;

    // Conta a frequência de cada preço
    if (priceFrequency[price]) {
      priceFrequency[price]++;
    } else {
      priceFrequency[price] = 1;
    }
  });

  // Ordena os preços pela frequência em ordem decrescente
  const sortedPriceFrequency = Object.entries(priceFrequency).sort((a, b) => b[1] - a[1]);

  // Calcula a média dos preços
  const averagePrice = totalSum / totalCount;

  return {
    frequency: sortedPriceFrequency,
    averagePrice: averagePrice
  };
}

const countPriceFrequencyUsedFalse = (products) => {
  // Filtra apenas os produtos onde "used" é false
  const filteredProducts = products.filter(product => product.used === false);

  // Cria um objeto para armazenar a frequência de cada preço
  const priceFrequency = {};
  let totalSum = 0;
  let totalCount = 0;

  // Itera sobre cada produto filtrado
  filteredProducts.forEach(product => {
    // Usa o preço (price), ou o preço inicial (initialPrice) se o price não existir
    const price = product.price !== undefined ? product.price : product.initialPrice;

    // Calcula a soma total e o número de produtos para a média
    totalSum += price;
    totalCount++;

    // Conta a frequência de cada preço
    if (priceFrequency[price]) {
      priceFrequency[price]++;
    } else {
      priceFrequency[price] = 1;
    }
  });

  // Ordena os preços pela frequência em ordem decrescente
  const sortedPriceFrequency = Object.entries(priceFrequency).sort((a, b) => b[1] - a[1]);

  // Calcula a média dos preços
  const averagePrice = totalSum / totalCount;

  return {
    frequency: sortedPriceFrequency,
    averagePrice: averagePrice
  };
}

const avgPrice = (products) => {
  const filteredProducts = products.filter(product => product.used === false);

  // Passo 1: Criar um array de preços, usando `price` ou `initialPrice`
  const prices = filteredProducts.map(product => 
    product.price !== undefined ? product.price : product.initialPrice
  );

  // Passo 2: Ordenar o array de preços do maior para o menor
  prices.sort((a, b) => b - a);

  // Passo 3: Calcular quantos itens correspondem a 10% (arredondar para baixo)
  const tenPercent = Math.floor(prices.length * 0.3);
  // console.log('tenPercent: ', tenPercent);

  // Passo 4: Remover 10% dos maiores e 10% dos menores valores
  const filteredPrices = prices.slice(tenPercent, prices.length - tenPercent);

  // Passo 5: Calcular a média dos preços restantes
  const total = filteredPrices.reduce((sum, price) => sum + price, 0);
  const average = total / filteredPrices.length;

  return average;
};

(async () => {
  const products = await getProductsFromFile();
  const words = ['dunk', 'low', 'panda']
  console.log('words: ', words);
  const filteredProducts = filterProducts(products, words);
  console.log("filteredProducts: ", filteredProducts.length);

  const avgPriceData = avgPrice(filteredProducts)
  console.log('avgPriceData: ', avgPriceData);

  // const priceFrequency = countPriceFrequency(filteredProducts)
  // console.log('priceFrequency: ', priceFrequency);

  // const priceFrequencyUsedFalse = countPriceFrequencyUsedFalse(filteredProducts)
  // console.log('priceFrequencyUsedFalse: ', priceFrequencyUsedFalse);

  // const wordFrequencyTitle = countWordFrequencyTitle(filteredProducts);
  // console.log("wordFrequencyTitle: ", wordFrequencyTitle);

  // const wordFrequencyDescription = countWordFrequencyDescription(filteredProducts);
  // console.log("wordFrequencyDescription: ", wordFrequencyDescription);
})();
