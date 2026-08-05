(function () {
  'use strict';

  var endpoint = String(window.PRODUCTS_API_URL || '').trim();
  var categoryRules = {
    '\u624b\u673a': ['\u624b\u673a', '\u62cd\u7167', '\u5f71\u50cf', '\u6e38\u620f'],
    '\u7535\u8111': ['\u7535\u8111', '\u7b14\u8bb0\u672c', '\u8f7b\u8584', '\u529e\u516c', '\u5b66\u4e60', '\u526a\u8f91'],
    '\u6570\u7801': ['\u8033\u673a', '\u964d\u566a', '\u97f3\u7bb1', '\u5e73\u677f', '\u76f8\u673a', '\u6295\u5f71'],
    '\u5ba0\u7269\u7528\u54c1': ['\u5ba0\u7269', '\u732b', '\u72d7', '\u732b\u7cae', '\u72d7\u7cae', '\u73a9\u5177'],
    '\u5bb6\u5c45': ['\u5bb6\u5c45', '\u6e05\u6d01', '\u7761\u7720', '\u53a8\u623f', '\u6536\u7eb3'],
    '\u793c\u7269': ['\u793c\u7269', '\u9001\u793c', '\u751f\u65e5', '\u7eaa\u5ff5']
  };

  function categoryFor(query) {
    var text = String(query || '');
    var categories = Object.keys(categoryRules);

    for (var i = 0; i < categories.length; i += 1) {
      var category = categories[i];
      var terms = categoryRules[category];

      if (text.indexOf(category) !== -1) {
        return category;
      }

      for (var j = 0; j < terms.length; j += 1) {
        if (text.indexOf(terms[j]) !== -1) {
          return category;
        }
      }
    }

    return '';
  }

  function normalizeProduct(product) {
    product = product || {};

    return {
      id: product.id || product._id || '',
      name: product.name || '',
      category: product.category || '',
      brand: product.brand || '',
      price: product.price || '',
      image: product.image || '',
      description: product.description || '',
      specs: product.specs || {},
      tags: Array.isArray(product.tags) ? product.tags : [],
      pros: Array.isArray(product.pros) ? product.pros : [],
      cons: Array.isArray(product.cons) ? product.cons : [],
      suitableFor: product.suitableFor || product.people || '',
      url: product.url || (product.purchaseUrl && product.purchaseUrl.jd) || '',
      purchaseUrl: product.purchaseUrl || { jd: product.url || '', taobao: '' },
      type: product.type || product.category || '',
      reason: product.reason || product.description || '',
      intro: product.intro || product.description || '',
      advice: product.advice || '',
      worth: product.worth || '',
      score: Number(product.score) || 80,
      people: product.people || product.suitableFor || ''
    };
  }

  function getLocalProducts(query) {
    var source = Array.isArray(window.productDatabase) ? window.productDatabase : [];
    var category = categoryFor(query);
    var matched = source;

    if (category) {
      matched = source.filter(function (product) {
        return product && product.category === category;
      });
    }

    if (!matched.length) {
      matched = source;
    }

    return matched.slice(0, 12).map(normalizeProduct);
  }

  async function getCandidates(query) {
    var cleanQuery = String(query || '').trim();
    var category = categoryFor(cleanQuery);

    try {
      if (!endpoint) {
        throw new Error('window.PRODUCTS_API_URL is not configured');
      }

      console.info('[products] requesting CloudBase catalog', {
        url: endpoint,
        query: cleanQuery,
        category: category
      });

      var response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: category ? '' : cleanQuery,
          category: category,
          limit: 12
        })
      });

      var payload = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(payload.error || ('products request failed: ' + response.status));
      }

      var products = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload.products) ? payload.products : []);
      if (!products.length) {
        throw new Error('products collection returned no candidates');
      }

      console.info('[products] CloudBase catalog request succeeded', {
        count: products.length
      });

      return {
        products: products.map(normalizeProduct),
        source: 'database',
        error: null
      };
    } catch (error) {
      var message = error && error.message ? error.message : String(error);
      console.warn('[products] using local fallback', { reason: message });

      return {
        products: getLocalProducts(cleanQuery),
        source: 'fallback',
        error: message
      };
    }
  }

  window.productService = {
    getCandidates: getCandidates,
    categoryFor: categoryFor,
    config: { endpoint: endpoint }
  };
}());
