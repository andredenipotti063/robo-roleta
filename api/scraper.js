// api/scraper.js - Coloque este arquivo em uma pasta "api" no Vercel

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = 'https://www.casino.org/casinoscores/pt-br/gates-of-olympus-roulette/';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = await response.text();

    // Extrair números da aba "Últimas Rodadas"
    const numeros = extrairNumeros(html);

    if (numeros.length < 10) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Apenas ${numeros.length} números encontrados`,
        numeros: numeros
      });
    }

    res.status(200).json({
      sucesso: true,
      numeros: numeros.slice(0, 10),
      timestamp: new Date().toISOString()
    });

  } catch (erro) {
    console.error('Erro:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao capturar dados: ' + erro.message
    });
  }
}

function extrairNumeros(html) {
  const numeros = [];
  const regex = /\b([0-3]?[0-9])\b/g;
  let match;
  const encontrados = new Set();

  while ((match = regex.exec(html)) !== null) {
    const num = parseInt(match[1]);
    if (num >= 0 && num <= 36) {
      encontrados.add(num);
    }
  }

  // Retornar últimos números encontrados
  const arr = Array.from(encontrados).reverse().slice(0, 15);
  
  for (let num of arr) {
    numeros.unshift(num);
  }

  return numeros.slice(-10);
}
