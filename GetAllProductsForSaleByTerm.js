import fs from "fs";

const getProductsForSaleByTerm = async (term, after) => {
  const headersList = {
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
  };
  const api = "https://enjusearch.enjoei.com.br";
  const path = "/graphql-search-x";
  const query = new URLSearchParams({
    term: term,
    first: "30",
    query_id: "3eeaf3e4f425c8b4305ded1361992243",
    search_id: "f1e7d875-f232-445b-a8e9-bd679275be51-1728245673190",
    after: after,
    // city: "monte-mor",
    // state: "sp",
    // shipping_range: "same_city",
  }).toString();
  const url = `${api}${path}?${query}`;

  const response = await fetch(url, {
    method: "GET",
    headers: headersList,
  });

  const dataText = await response.text();
  const data = JSON.parse(dataText);
  console.log("Total de produtos:", data?.data?.search?.products?.total);
  return data?.data?.search?.products?.edges;
};

const loopToGetAllProductsForSaleByTerm = async (term) => {
  let allProducts = [];
  let after = "";

  while (true) {
    const products = await getProductsForSaleByTerm(term, after);
    if (!products || products?.length === 0) {
      break;
    }

    products?.forEach((data) => {
      const node = data.node;
      allProducts.push({
        id: node.id,
        store: node.store.path,
      });
    });

    const afterData = products[products?.length - 1].cursor;
    const nextAfter = afterData.includes(":") ? afterData : `${afterData}:1`;
    after = nextAfter;

    console.log("allProducts", allProducts);
  }

  // INSERIR LÓGICA QUE INSERE O ARRAY allProducts DENTRO DE UM ARQUIVO JSON
  fs.writeFileSync("products.json", JSON.stringify(allProducts, null, 2));
  console.log("Products saved to products.json");
};

(async () => {
  const config = {
    term: "dunk",
  };
  await loopToGetAllProductsForSaleByTerm(config?.term);
})();
