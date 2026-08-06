(function () {
  'use strict';

  var CATEGORIES = {
    food: '\u98df\u54c1',
    phone: '\u624b\u673a',
    computer: '\u7535\u8111',
    digital: '\u6570\u7801',
    pet: '\u5ba0\u7269\u7528\u54c1',
    home: '\u5bb6\u5c45',
    gift: '\u793c\u7269'
  };

  var groups = [
    {
      category: CATEGORIES.phone,
      image: 'phone',
      audience: '\u91cd\u89c6\u65e5\u5e38\u4f7f\u7528\u4e0e\u5f71\u50cf\u4f53\u9a8c\u7684\u7528\u6237',
      items: [
        ['phone-nova-x-pro', 'Nova X Pro', 5299, 'Nova', ['\u62cd\u7167', '\u65d7\u8230', '\u6027\u80fd']],
        ['phone-nova-x', 'Nova X', 3699, 'Nova', ['\u65e5\u5e38', '\u6027\u80fd', '\u957f\u7eed\u822a']],
        ['phone-pixel-vision', 'Pixel Vision', 4899, 'Pixel', ['\u5f71\u50cf', '\u62cd\u7167', '\u65c5\u884c']],
        ['phone-galaxy-lite', 'Galaxy Lite', 2899, 'Galaxy', ['\u6027\u4ef7\u6bd4', '\u957f\u7eed\u822a', '\u624b\u673a']],
        ['phone-iphone-style', 'iPhone Style', 5999, 'iPhone', ['\u89c6\u9891', '\u751f\u6001', '\u65d7\u8230']],
        ['phone-red-magic-air', 'Red Magic Air', 3299, 'Red Magic', ['\u6e38\u620f', '\u6027\u80fd', '\u6563\u70ed']],
        ['phone-mate-view', 'Mate View', 4299, 'Mate', ['\u5546\u52a1', '\u901a\u8baf', '\u62cd\u7167']],
        ['phone-find-portrait', 'Find Portrait', 3999, 'Find', ['\u4eba\u50cf', '\u62cd\u7167', '\u5feb\u5145']],
        ['phone-one-turbo', 'One Turbo', 2499, 'One', ['\u6027\u4ef7\u6bd4', '\u6e38\u620f', '\u6027\u80fd']],
        ['phone-mini-pro', 'Mini Pro', 4599, 'Mini', ['\u5c0f\u5c4f', '\u65d7\u8230', '\u4fbf\u643a']]
      ]
    },
    {
      category: CATEGORIES.computer,
      image: 'laptop',
      audience: '\u5b66\u4e60\u3001\u901a\u52e4\u4e0e\u65e5\u5e38\u529e\u516c\u7528\u6237',
      items: [
        ['pc-air-14', 'Air 14', 4999, 'Air', ['\u8f7b\u8584', '\u529e\u516c', '\u7b14\u8bb0\u672c']],
        ['pc-pro-studio-16', 'Pro Studio 16', 8999, 'Pro', ['\u521b\u4f5c', '\u526a\u8f91', '\u8bbe\u8ba1']],
        ['pc-game-core-15', 'Game Core 15', 7299, 'Game', ['\u6e38\u620f', '\u6027\u80fd', '\u6563\u70ed']],
        ['pc-book-plus-14', 'Book Plus 14', 5699, 'Book', ['\u5b66\u751f', '\u529e\u516c', '\u4fbf\u643a']],
        ['pc-think-work-x', 'Think Work X', 6499, 'Think', ['\u5546\u52a1', '\u529e\u516c', '\u7a33\u5b9a']],
        ['pc-mini-desk', 'Mini Desk', 3899, 'Mini', ['\u53f0\u5f0f', '\u5bb6\u7528', '\u6027\u4ef7\u6bd4']],
        ['pc-creator-one', 'Creator One', 7999, 'Creator', ['\u8bbe\u8ba1', '\u521b\u4f5c', '\u9ad8\u6027\u80fd']],
        ['pc-cloud-book', 'Cloud Book', 3299, 'Cloud', ['\u7f51\u8bfe', '\u5b66\u4e60', '\u8f7b\u8584']],
        ['pc-ultra-book-13', 'Ultra Book 13', 4399, 'Ultra', ['\u4fbf\u643a', '\u8f7b\u8584', '\u901a\u52e4']],
        ['pc-home-office-15', 'Home Office 15', 4799, 'Home', ['\u5bb6\u7528', '\u529e\u516c', '\u5927\u5c4f']]
      ]
    },
    {
      category: CATEGORIES.digital,
      image: 'headphones',
      audience: '\u9700\u8981\u63d0\u5347\u65e5\u5e38\u6570\u7801\u4f53\u9a8c\u7684\u7528\u6237',
      items: [
        ['digital-quiet-pro', 'Quiet Pro', 1299, 'Quiet', ['\u8033\u673a', '\u964d\u566a', '\u901a\u52e4']],
        ['digital-sound-mini', 'Sound Mini', 599, 'Sound', ['\u97f3\u7bb1', '\u97f3\u4e50', '\u4fbf\u643a']],
        ['digital-vision-cam', 'Vision Cam', 2399, 'Vision', ['\u76f8\u673a', '\u65c5\u884c', '\u5f71\u50cf']],
        ['digital-pocket-projector', 'Pocket Projector', 1899, 'Pocket', ['\u6295\u5f71', '\u5bb6\u7528', '\u89c2\u5f71']],
        ['digital-fast-charge-100w', 'Fast Charge 100W', 299, 'Fast', ['\u5145\u7535\u5668', '\u5feb\u5145', '\u6570\u7801']],
        ['digital-action-go', 'Action Go', 1699, 'Action', ['\u8fd0\u52a8', '\u76f8\u673a', '\u6237\u5916']],
        ['digital-reader-ink', 'Reader Ink', 1099, 'Reader', ['\u9605\u8bfb', '\u7535\u5b50\u4e66', '\u5b66\u4e60']],
        ['digital-pad-light-11', 'Pad Light 11', 2799, 'Pad', ['\u5e73\u677f', '\u5b66\u4e60', '\u8f7b\u8584']],
        ['digital-keyboard-air', 'Keyboard Air', 429, 'Keyboard', ['\u952e\u76d8', '\u529e\u516c', '\u6548\u7387']],
        ['digital-router-mesh', 'Router Mesh', 699, 'Router', ['\u8def\u7531\u5668', '\u7f51\u7edc', '\u5bb6\u7528']]
      ]
    },
    {
      category: CATEGORIES.pet,
      image: 'watch',
      audience: '\u5173\u6ce8\u5ba0\u7269\u65e5\u5e38\u996e\u98df\u4e0e\u62a4\u7406\u7684\u4e3b\u4eba',
      items: [
        ['pet-adult-dog-food', 'Adult Dog Food', 239, 'Petwise', ['\u5ba0\u7269', '\u72d7\u7cae', '\u4e3b\u7cae']],
        ['pet-protein-cat-food', 'High Protein Cat Food', 269, 'Petwise', ['\u5ba0\u7269', '\u732b\u7cae', '\u9ad8\u86cb\u767d']],
        ['pet-freeze-snacks', 'Freeze Dried Snacks', 99, 'Petwise', ['\u5ba0\u7269', '\u96f6\u98df', '\u51bb\u5e72']],
        ['pet-puzzle-toy', 'Puzzle Feeder Toy', 89, 'Petwise', ['\u5ba0\u7269', '\u73a9\u5177', '\u76ca\u667a']],
        ['pet-catnip-ball', 'Catnip Ball', 49, 'Petwise', ['\u5ba0\u7269', '\u732b\u73a9\u5177', '\u8f7b\u5a31\u4e50']],
        ['pet-water-fountain', 'Water Fountain', 189, 'Petwise', ['\u5ba0\u7269', '\u996e\u6c34', '\u81ea\u52a8']],
        ['pet-chew-toy', 'Chew Toy', 69, 'Petwise', ['\u5ba0\u7269', '\u72d7\u73a9\u5177', '\u8010\u54ac']],
        ['pet-carrier-backpack', 'Pet Carrier', 159, 'Petwise', ['\u5ba0\u7269', '\u51fa\u884c', '\u732b\u72d7']],
        ['pet-grooming-set', 'Grooming Set', 79, 'Petwise', ['\u5ba0\u7269', '\u62a4\u7406', '\u6e05\u6d01']],
        ['pet-smart-feeder', 'Smart Feeder', 399, 'Petwise', ['\u5ba0\u7269', '\u5582\u98df', '\u667a\u80fd']]
      ]
    },
    {
      category: CATEGORIES.food,
      image: 'watch',
      audience: '\u9700\u8981\u9009\u62e9\u96f6\u98df\u6216\u5ba0\u7269\u98df\u54c1\u7684\u7528\u6237',
      items: [
        ['food-freeze-dried-snacks', 'Freeze Dried Snacks', 99, 'Petwise', ['\u98df\u54c1', '\u96f6\u98df', '\u51bb\u5e72']],
        ['food-cat-creamy-treats', 'Cat Creamy Treats', 79, 'Petwise', ['\u98df\u54c1', '\u732b\u96f6\u98df', '\u9002\u53e3\u6027']],
        ['food-dog-training-treats', 'Dog Training Treats', 89, 'Petwise', ['\u98df\u54c1', '\u72d7\u96f6\u98df', '\u8bad\u7ec3']],
        ['food-nutrition-dog-food', 'Nutrition Dog Food', 239, 'Petwise', ['\u98df\u54c1', '\u72d7\u7cae', '\u4e3b\u7cae']],
        ['food-protein-cat-food', 'Protein Cat Food', 269, 'Petwise', ['\u98df\u54c1', '\u732b\u7cae', '\u9ad8\u86cb\u767d']]
      ]
    },
    {
      category: CATEGORIES.home,
      image: 'laptop',
      audience: '\u5e0c\u671b\u63d0\u5347\u5bb6\u5c45\u6548\u7387\u4e0e\u8212\u9002\u5ea6\u7684\u7528\u6237',
      items: [
        ['home-robot-vacuum', 'Robot Vacuum', 1999, 'Home', ['\u5bb6\u5c45', '\u6e05\u6d01', '\u626b\u5730']],
        ['home-eye-care-lamp', 'Eye Care Lamp', 249, 'Home', ['\u5bb6\u5c45', '\u53f0\u706f', '\u5b66\u4e60']],
        ['home-memory-pillow', 'Memory Pillow', 329, 'Home', ['\u5bb6\u5c45', '\u7761\u7720', '\u6795\u5934']],
        ['home-air-purifier', 'Air Purifier', 1299, 'Home', ['\u5bb6\u5c45', '\u51c0\u5316', '\u5065\u5eb7']],
        ['home-kettle', 'Smart Kettle', 199, 'Home', ['\u5bb6\u5c45', '\u53a8\u623f', '\u6c34\u58f6']],
        ['home-storage-cart', 'Storage Cart', 149, 'Home', ['\u5bb6\u5c45', '\u6536\u7eb3', '\u4fbf\u5229']],
        ['home-ergo-chair', 'Ergo Chair', 1599, 'Ergo', ['\u5bb6\u5c45', '\u529e\u516c', '\u6905\u5b50']],
        ['home-aroma-diffuser', 'Aroma Diffuser', 169, 'Home', ['\u5bb6\u5c45', '\u9999\u6c1b', '\u653e\u677e']],
        ['home-smart-lock', 'Smart Lock', 1299, 'Home', ['\u5bb6\u5c45', '\u5b89\u5168', '\u667a\u80fd']],
        ['home-kitchen-machine', 'Kitchen Machine', 499, 'Home', ['\u5bb6\u5c45', '\u53a8\u623f', '\u6599\u7406']]
      ]
    },
    {
      category: CATEGORIES.gift,
      image: 'phone',
      audience: '\u9700\u8981\u9001\u793c\u3001\u7eaa\u5ff5\u6216\u8868\u8fbe\u5fc3\u610f\u7684\u7528\u6237',
      items: [
        ['gift-pen-set', 'Classic Pen Set', 359, 'Classic', ['\u793c\u7269', '\u9001\u793c', '\u5546\u52a1']],
        ['gift-scent-box', 'Scent Gift Box', 429, 'Scent', ['\u793c\u7269', '\u9999\u6c1b', '\u8282\u65e5']],
        ['gift-block-bouquet', 'Block Bouquet', 269, 'Build', ['\u793c\u7269', '\u751f\u65e5', '\u521b\u610f']],
        ['gift-record-player', 'Record Player', 899, 'Sound', ['\u793c\u7269', '\u97f3\u4e50', '\u521b\u610f']],
        ['gift-cup-set', 'Thermal Cup Set', 199, 'Daily', ['\u793c\u7269', '\u5b9e\u7528', '\u65e5\u5e38']],
        ['gift-chocolate', 'Handmade Chocolate', 159, 'Sweet', ['\u793c\u7269', '\u8282\u65e5', '\u7f8e\u98df']],
        ['gift-photo-frame', 'Photo Frame', 299, 'Memory', ['\u793c\u7269', '\u7eaa\u5ff5', '\u5b9a\u5236']],
        ['gift-tea-set', 'Tea Gift Set', 399, 'Tea', ['\u793c\u7269', '\u957f\u8f88', '\u8336\u5177']],
        ['gift-fitness-band', 'Fitness Band', 399, 'Fit', ['\u793c\u7269', '\u5065\u5eb7', '\u8fd0\u52a8']],
        ['gift-travel-set', 'Travel Organizer', 229, 'Travel', ['\u793c\u7269', '\u65c5\u884c', '\u5b9e\u7528']]
      ]
    }
  ];

  var CHINESE_NAMES = {
    'gift-pen-set': '\u7ecf\u5178\u5546\u52a1\u94a2\u7b14\u793c\u76d2',
    'gift-scent-box': '\u9999\u6c1b\u62a4\u7406\u793c\u76d2',
    'gift-block-bouquet': '\u521b\u610f\u79ef\u6728\u82b1\u675f',
    'gift-record-player': '\u590d\u53e4\u5531\u7247\u673a',
    'gift-cup-set': '\u4fdd\u6e29\u676f\u793c\u76d2',
    'gift-chocolate': '\u624b\u5de5\u5de7\u514b\u529b',
    'gift-photo-frame': '\u5b9a\u5236\u56de\u5fc6\u76f8\u6846',
    'gift-tea-set': '\u7cbe\u9009\u8336\u793c\u76d2',
    'gift-fitness-band': '\u667a\u80fd\u8fd0\u52a8\u624b\u73af',
    'gift-travel-set': '\u65c5\u884c\u6536\u7eb3\u793c\u76d2'
  };

  function createProduct(group, item) {
    var id = item[0];
    var name = item[1];
    var price = item[2];
    var brand = item[3];
    var tags = item[4];
    var description = group.category + '\u7c7b\u76ee\u7684\u7cbe\u9009\u5546\u54c1\uff0c\u9002\u5408\u7ed3\u5408\u4f7f\u7528\u573a\u666f\u3001\u4ef7\u683c\u548c\u6807\u7b7e\u7efc\u5408\u9009\u62e9\u3002';
    var url = 'https://www.jd.com/';

    return {
      id: id,
      name_cn: CHINESE_NAMES[id] || group.category + '\u7cbe\u9009\u5546\u54c1',
      name: name,
      category: group.category,
      price: price,
      brand: brand,
      description: description,
      tags: tags,
      image: group.image,
      url: url,
      specs: {},
      pros: ['\u54c1\u7c7b\u5b9a\u4f4d\u660e\u786e', '\u4ef7\u683c\u4fe1\u606f\u900f\u660e'],
      cons: ['\u8bf7\u4ee5\u5e73\u53f0\u5b9e\u65f6\u89c4\u683c\u4e3a\u51c6'],
      suitableFor: group.audience,
      purchaseUrl: { jd: url, taobao: '' },
      type: group.category,
      reason: description,
      intro: description,
      advice: '\u8d2d\u4e70\u524d\u8bf7\u6839\u636e\u9884\u7b97\u4e0e\u5b9e\u9645\u89c4\u683c\u8fdb\u884c\u6700\u7ec8\u6bd4\u5bf9\u3002',
      worth: '\u5efa\u8bae\u7ed3\u5408\u9700\u6c42\u9009\u8d2d',
      score: 80,
      people: group.audience
    };
  }

  window.productDatabase = groups.reduce(function (products, group) {
    return products.concat(group.items.map(function (item) {
      return createProduct(group, item);
    }));
  }, []);
}());
