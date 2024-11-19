import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderedItems.updateMany({
    where: {
      name: "NO. 2 OSYTER MUSHROOM 5 LB"
    },
    data: {
      name: 'NO. 2 OYSTER MUSHROOM 5 LB',
      inventoryItemId: 41
    }
  });

  await prisma.orderedItems.updateMany({
    where: {
      name: "SOYA 24X1"
    },
    data: {
      name: 'SOYA 24X1 LB',
      inventoryItemId: 23
    }
  });

  await prisma.orderedItems.updateMany({
    where: {
      name: {in: ["BEAN 24X1", "BEANSPROUTS 24 x 1 LB"]}
    },
    data: {
      name: 'BEAN 24X1 LB',
      inventoryItemId: 20
    }
  });

  await prisma.orderedItems.updateMany({
    where: {
      name: "흰 버섯 - WHITE MUSHROOM"
    },
    data: {
      name: '흰 버섯 - NO. 1 MUSHROOM WHITE 10 LB',
      inventoryItemId: 25
    }
  })

  await prisma.orderedItems.updateMany({
    where: {
      name: "GINGER 30 LB"
    },
    data: {
      name: 'ORGANIC GINGER 30 LB',
      inventoryItemId: 56
    }
  });

  await prisma.orderedItems.updateMany({
    where: {
      name: "JUMBO EGGS"
    },
    data: {
      name: 'JUMBO EGG',
      inventoryItemId: 65
    }
  });



  // // BEAN 10 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["BEAN 10 LB", "숙주나물 - BEAN 10 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 18
  //   }
  // });

  // // BEAN 5 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["BEAN 5 LB", "숙주나물 - BEAN 5 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 19
  //   }
  // });

  // // BEAN 24X1 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["BEAN 24X1 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 20
  //   }
  // });

  // // SOYA 24X1 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["SOYA 24X1 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 23
  //   }
  // });

  // // K. SOYA 24X1 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["KOREAN SOYA 1X24"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 21
  //   }
  // });

  // // SOYA 5 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["SOYA 5 LB", "콩나물 - SOYA 5 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 71
  //   }
  // });

  // // SOYA 10 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["SOYA 10 LB", "콩나물 - SOYA 10 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 70
  //   }
  // });

  // // BASIL
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["BASIL", "바질 - BASIL"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 51
  //   }
  // });

  // // LIME NO. 1
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["LIME NO. 1", "라임 - LIME NO. 1"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 43
  //   }
  // });

  // // LIME NO. 2
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["LIME NO. 2", "라임 - LIME NO. 2"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 77
  //   }
  // });

  // // LEMON
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["LEMON", "레몬 - LEMON"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 78
  //   }
  // });

  // // TRADITIONAL TOFU
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["TRADITIONAL TOFU", "SR 전통 두부 - TRADITIONAL TOFU"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 52
  //   }
  // });

  // // OG CHINESE PUFF
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["OG CHINESE PUFF", "SR 오리지널 중국 퍼프 - OG CHINESE PUFF"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 54
  //   }
  // });

  // // FRIED TOFU
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["FRIED TOFU", "SR 튀긴 두부 - FRIED TOFU"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 55
  //   }
  // });

  // // FIRM TOFU
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["FIRM TOFU", "SR 단단한 두부 - FIRM TOFU"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 79
  //   }
  // });

  // // MEDIUM FIRM TOFU
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["MEDIUM FIRM TOFU", "SR 중간 단단한 두부 - MEDIUM FIRM TOFU"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 53
  //   }
  // });

  // // SILKEN TUBE TOFU
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["SILKEN TUBE TOFU", "SR 실크 두부 - SILKEN TUBE TOFU"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 80
  //   }
  // });

  // // JUMBO EGG
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["점보 계란 - JUMBO EGG", "JUMBO EGG"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 65
  //   }
  // });
  
  // // LARGE EGG
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["계란 - LAGRE EGG", "LARGE EGG"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 49
  //   }
  // });

  // // XL EGG
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["XL EGG"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 86
  //   }
  // });

  // // LIQUID EGG 33 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["LIQUID EGG 33 LB", "LIQUID EGG", "액란 33파운드 - LIQUID EGG 33 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 17
  //   }
  // });

  // // EGGPLANTS
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["EGGPLANTS 30 LB", "EGGPLANTS", "가지 - EGGPLANTS 30 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 64
  //   }
  // });

  // // DAIKON
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["DAIKON", "무 - DAIKON 40 LB", "DAIKON 40 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 72
  //   }
  // });

  // // JUMBO CARROT
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["점보 당근 - JUMBO CARROT", "JUMBO CARROT"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 47
  //   }
  // });

  // // BROCCOLI
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["브로콜리 - BROCCOLI 20 LB", "BROCCOLI 20 LB", "BROCCOLI"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 46
  //   }
  // });

  // // BELL PEPPER
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["벨 페퍼 - NO. 2 BELL PEPPER 25 LB", "NO. 2 BELL PEPPER 25 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 81
  //   }
  // });

  // // WHITE ONION
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["백합양파 - WHITE ONION 50 LB", "WHITE ONION 50 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 42
  //   }
  // });

  // // POTATO
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["POTATO", "감자 -  POTATO"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 82
  //   }
  // });

  // // PEEL GARLIC
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["PEEL GARLIC", "PEELED GARLIC", "PEELED GARLIC 5 LB", "껍질 벗긴 마늘 - PEELED GARLIC 5 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 48
  //   }
  // });

  // // NO. 1 MUSHROOM WHITE
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["NO. 1 MUSHROOM WHITE 10 LB", "흰 버섯 - NO. 1 MUSHROOM WHITE 10 LB", "WHITE MUSHROOM"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 25
  //   }
  // });

  // NO. 2 MUSHROOM WHITE
  await prisma.orderedItems.updateMany({
    where: {
      name: {
        in: ["NO. 2 MUSHROOM WHITE 10 LB", "흰 버섯 - NO. 2 MUSHROOM WHITE 10 LB"]
      },
      scheduledOrderId: {
        not: null
      }
    },
    data: {
      inventoryItemId: 26
    }
  });

  // // NO. 1 OYSTER MUSHROOM
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["느타리버섯 - NO. 1 OYSTER MUSHROOM 5 LB", "NO. 1 OYSTER MUSHROOM 5 LB", "OYSTER MUSHROOM #1"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 73
  //   }
  // });


  // // NO. 2 OYSTER MUSHROOM
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["느타리버섯 - NO. 2 OYSTER MUSHROOM 5 LB", "NO. 2 OYSTER MUSHROOM 5 LB", "OYSTER MUSHROOM #2"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 41
  //   }
  // });

  // // KING OYSTER
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["왕느타리버섯 - KING OYSTER", "KING OYSTER"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 83
  //   }
  // });

  // // SHIITAKE
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["SHIITAKE", "신선한 표고버섯 - SHIITAKE"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 84
  //   }
  // });

  // // FRESH RICE NOODLE
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["신선한 쌀국수 - FRESH RICE NOODLE 1 LB", "FRESH RICE NOODLE 1 LB", "FRESH RICE NOODLES 1 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 60
  //   }
  // });

  // // WONTON NOODLE
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["완탕면 - WONTON NOODLE 1 LB", "WONTON NOODLE 1 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 45
  //   }
  // });

  // // CHOW MEIN
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["차우면 - CHOW MEIN 10 LB", "CHOW MEIN", "CHOW MEIN 10 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 85
  //   }
  // });

  // // GINGER
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["ORGANIC GINGER 30 LB", "GINGER", "ORGANIC GINGER"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 56
  //   }
  // });

  // // USA GREEN CABBAGE
  // await prisma.orderedItems.updateMany({
  //  where: {
  //    name: {
  //      in: ["USA GREEN CABBAGE"]
  //    },
  //    scheduledOrderId: {
  //      not: null
  //    }
  //  },
  //  data: {
  //    inventoryItemId: 88
  //  }
  // });

  // // BANH PHO SINCERE 30 LB
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["BANH PHO SINCERE 30 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 40
  //   }
  //  });

  //  // TOFU PUFF
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["TOFU PUFF"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 91
  //   }
  //  });

  //  // SOFT TOFU
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["SOFT TOFU"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 90
  //   }
  //  });

  //   // PREMIUM SOFT TOFU
  // await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["PREMIUM SOFT TOFU"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 89
  //   }
  //  });

  //  // LEUCOCASIA / BAC HA 20 LB
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["LEUCOCASIA / BAC HA 20 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 87
  //   }
  //  });

  //  // LEUCOCASIA / BAC HA 30 LB
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["LEUCOCASIA / BAC HA 30 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 93
  //   }
  //  });

  //  // BASIL BOX
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["BASIL 20 LB BOX", "BASIL BOX"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 94
  //   }
  //  });

  //  // OYSTER PRE PACKED
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["OYSTER PRE PACKED"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 95
  //   }
  //  });

  //  // TARO
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["TARO", "TARO 40 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 76
  //   }
  //  });

  //  // FISH SAUCE
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["FISH SAUCE"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 75
  //   }
  //  });

  //  // TARO STEM
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["TARO STEM"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 68
  //   }
  //  });

  //  // JUMBO ONION
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["JUMBO ONION 50 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 24
  //   }
  //  });

  //  // BROWN MUSHROOM
  //  await prisma.orderedItems.updateMany({
  //   where: {
  //     name: {
  //       in: ["BROWN MUSHROOM 5 LB"]
  //     },
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   data: {
  //     inventoryItemId: 92
  //   }
  //  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
