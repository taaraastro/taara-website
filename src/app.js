/* ===== Spatik Astro app ===== */
const A = Astro;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (x, a = 12, b = 98) => Math.max(a, Math.min(b, Math.round(x)));
const ord = n => n + (["th","st","nd","rd"][(n % 100 - 20) % 10] || ["th","st","nd","rd"][n % 100] || "th");
const store = {
  get(k, d) { try { const v = localStorage.getItem("taara." + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("taara." + k, JSON.stringify(v)); } catch (e) {} },
};
const FEEDBACK_URL = CFG.feedbackUrl || ""; // a Google Form link to collect reviews
/* ===== PLANS: edit prices and limits here ===== */
const PLANS = {
  free:      { name: "Free",      m: 0,   y: 0,    kundlis: 2,        questions: CFG.freeQuestions ?? 5 },
  silver:    { name: "Silver",    m: 179,  y: 1790,  kundlis: 5,        questions: 100 },
  gold:      { name: "Gold",      m: 479,  y: 4790, kundlis: 15,       questions: Infinity },
  unlimited: { name: "Unlimited", m: 1259, y: 12590, kundlis: Infinity, questions: Infinity },
};
const ADDON_PRICE = 219; // one extra kundli slot, one-time
/* Paste a payment link for each (for example a free Razorpay Payment Page). Empty = "contact us" message. */
const PAY_LINKS = Object.assign({ "qpack15": "", "qpack40": "",  "voicepack": "", "report": "", "reportpack": "", "silver-m": "", "silver-y": "", "gold-m": "", "gold-y": "", "unlimited-m": "", "unlimited-y": "", "addon": "" }, CFG.payLinks || {});
const CONTACT = CFG.contact || "WhatsApp us to upgrade"; // shown when a payment link is empty
const CODE_HASHES = {"177c1e35a50ca7dd":"silver-m","fe340a9d8cb22dc0":"silver-m","dd241b1fa2fc1002":"silver-m","f5e6021896bf4c3c":"silver-m","55213883162bd9a1":"silver-m","241911af69b117df":"silver-m","993f79a5b0eaf7d4":"silver-m","95fae5e8c378f008":"silver-m","d19364aa54c0025e":"silver-m","824509dcddc886f2":"silver-m","dc08db0f2dca2059":"silver-m","01a8a0d11861a376":"silver-m","1cd886d7ae5748a9":"silver-m","ba17735bbac28f30":"silver-m","4eb7b27a94ef9218":"silver-m","ab1ec7eba766e37f":"silver-m","6aa527c2cbd1ba62":"silver-m","b65a55b09547fc77":"silver-m","1a27a7c971990693":"silver-m","a34d62aeca458330":"silver-m","12f5f414fdf8bdcc":"silver-m","330b31d16b6d3b9b":"silver-m","dc64baab19df090a":"silver-m","91979e5c39795ecc":"silver-m","75fedde22bf71fb2":"silver-m","33690eb2604baa80":"silver-m","5f9440726c475bfa":"silver-m","4d6acdf009dd13cd":"silver-m","466c083fc93b9a00":"silver-m","3f850836d322b796":"silver-m","310cd88a94663a98":"silver-m","a3aafa64e39b6600":"silver-m","6dbd2e3aca1bcdb4":"silver-m","9e722057dddcc281":"silver-m","eba73558c0934492":"silver-m","93129d2d855485c4":"silver-m","11dbb68afa6e291d":"silver-m","b28f9ec9889c8451":"silver-m","ca9ed0b4f4443962":"silver-m","1406a6e35d14467e":"silver-m","05156831ea883bb6":"silver-m","76950eb144dbb80a":"silver-m","020417918bcf3cb7":"silver-m","0b714adbe8bca4cd":"silver-m","fbd110d9b4d5df53":"silver-m","a1a04f4b91c48246":"silver-m","52b1652c5f05ee26":"silver-m","190f9060f29f3a67":"silver-m","0fae186b1cceb4b9":"silver-m","633193681863c518":"silver-m","ec6976016afec816":"silver-m","11ccdd596866fdfd":"silver-m","d0a98a2e23e0e93b":"silver-m","30767683f0cd7565":"silver-m","12275d04603c03b8":"silver-m","d11b13d1b570c8fd":"silver-m","be43fd2ef75835dd":"silver-m","1eeec47ab5cfe2c5":"silver-m","b3886d82d9259c7c":"silver-m","8abc912b412e94af":"silver-m","391b79d496c0f45f":"silver-y","b4c85882ea02a333":"silver-y","e4d5d46e79bf0aa4":"silver-y","c8fe1f27a5854c57":"silver-y","4cb38b22d1610b49":"silver-y","6703d80fcc71f9d5":"silver-y","e684e61d21c1d22d":"silver-y","6fefc45fd87937ac":"silver-y","b59d6a8e20987fe3":"silver-y","ad259e2a9384662d":"silver-y","185411dc30b04bd5":"silver-y","f870d815198df456":"silver-y","f13745c7b1d648b7":"silver-y","824cdcc3026ae92b":"silver-y","6f67ee0cd266fe3f":"silver-y","15901860bc551494":"silver-y","8e89aa99395e1fd7":"silver-y","fd8741e572b0dde8":"silver-y","075a2d92adbeed6c":"silver-y","d7fe94f13764edbb":"silver-y","c1fb31733c67c11a":"silver-y","60f363745204157d":"silver-y","ad40d1c3eb4b1d54":"silver-y","0c92cb424d9d23c7":"silver-y","3b7245e5e5d280ba":"silver-y","c9028197f4d443e1":"silver-y","e29fd48096fd4acc":"silver-y","0cdce730dabe6d5a":"silver-y","2673ccf72a0dbc51":"silver-y","7d20ffb91dc39f40":"silver-y","2fc422067627c878":"silver-y","ccf214b03098ff90":"silver-y","d483a5888c4dce4e":"silver-y","1a346d0512efdc8d":"silver-y","f76341f638ee558e":"silver-y","4efe08511cfebaaa":"silver-y","1dc71b474c368942":"silver-y","5458e744a7b28d2a":"silver-y","6d6d40b71049ef66":"silver-y","2dd0841e31e7c16e":"silver-y","ffb2a4265cca55ca":"silver-y","f9f654d98c7c4fc1":"silver-y","f1d450f4b0497b2f":"silver-y","f1bea3eddaaaa7ac":"silver-y","38685d773b0a3b73":"silver-y","77a5c0846eb669c1":"silver-y","f172ff1630210124":"silver-y","8a8653110a72aad6":"silver-y","0814f64ccada9475":"silver-y","8e3b9cb962b3fb1f":"silver-y","4cb2f7ef781c8140":"silver-y","f49e8be0a129800a":"silver-y","d875368521590b7c":"silver-y","821471783875522f":"silver-y","a6b5354b233290b7":"silver-y","0e505f1701a6f388":"silver-y","2f9505593eba2d8e":"silver-y","7c805a89d78df02a":"silver-y","bb2a6e3544a574b4":"silver-y","10b01483f816bc10":"silver-y","348b254d3758559a":"gold-m","8c0586c59c505f14":"gold-m","312ce76256b7ab57":"gold-m","6f2203d03cc779ae":"gold-m","2aa963965dd87fbc":"gold-m","c3bffcd242dd1e66":"gold-m","a39b5ab179e2bc3a":"gold-m","af1e3c58473fee24":"gold-m","1973b5c4596b33bd":"gold-m","93affe503cd156f6":"gold-m","8db41242337f15aa":"gold-m","3814da0d2745e365":"gold-m","2d35acea2e5c08d3":"gold-m","5838dab23992c07a":"gold-m","8f9f877d562d63d8":"gold-m","f4ed5348fe05de30":"gold-m","cef3f7e2f8053896":"gold-m","7ecddc18256fa83f":"gold-m","c3b4b6ba0d277a77":"gold-m","501933d9c73b1a1d":"gold-m","6b2da98bbe7accb4":"gold-m","2febb2c4766a5e98":"gold-m","3ceb3c1d4fe0204b":"gold-m","88af9b8353fb8bbf":"gold-m","fd208323b046f597":"gold-m","895f1f85e88871fe":"gold-m","8ceefc23f4030283":"gold-m","f537f81cf69103c9":"gold-m","c913cc388a7fe4d2":"gold-m","b7a2c84f0f052a6d":"gold-m","a0775360aa260074":"gold-m","57d076a1367f5138":"gold-m","db407acae1c77635":"gold-m","907d402a83d5827d":"gold-m","10213a816b57d135":"gold-m","10fbb3fe0f94c165":"gold-m","eb8416a7501a19f5":"gold-m","5bf6ef186d476c27":"gold-m","c2cf602bba23b005":"gold-m","dae790aef7c3b483":"gold-m","80364c310dc886f3":"gold-m","8321aff61b93c0a6":"gold-m","30fcfd2453ae4a14":"gold-m","42ed4d279ab1acec":"gold-m","4cff765cefdfdcd8":"gold-m","216b91349669528d":"gold-m","ed689794e7eaa7c4":"gold-m","38441c689f716992":"gold-m","ab85c1b3e359744b":"gold-m","858dfc72b26d157b":"gold-m","e6c6f3cbfded309f":"gold-m","95f82d76b4661eb5":"gold-m","7844eb5b64b311c4":"gold-m","5769a2ea295f9012":"gold-m","185792a26d1fd5ea":"gold-m","8a9a4f4936bf82d3":"gold-m","ea4bdda0370eff25":"gold-m","4c350434923ee680":"gold-m","371b9bf9957e578e":"gold-m","e6b54c7b901ed5f4":"gold-m","c4390d81cd54600e":"gold-y","af72c610fd73f798":"gold-y","7024435034694b97":"gold-y","6c89b1620414242f":"gold-y","9b76ee3d8d080283":"gold-y","c594bd9a6892e430":"gold-y","fb28642cae487a84":"gold-y","bb449977d8f1d678":"gold-y","6249f87854145dbd":"gold-y","f5d30c0f8e58810e":"gold-y","e831c40611b42b39":"gold-y","817afd9dc0a1461b":"gold-y","b1c952ee1d60d19f":"gold-y","8d399de1a7e0f773":"gold-y","5679057da3990f8b":"gold-y","779ebff6eca29c76":"gold-y","3c541c3023f2eb28":"gold-y","3842a28d28255a0a":"gold-y","116cc22e45b9cf8a":"gold-y","3a8a92a65a9f1426":"gold-y","1c8154e8185e9807":"gold-y","23d36e41f2b8940e":"gold-y","5798e47cf2393771":"gold-y","426fe80f04d92d88":"gold-y","acb21074dfda4a0c":"gold-y","39f2ec6be1de9bee":"gold-y","77b3aca8b51feb03":"gold-y","c133d68190eb0b54":"gold-y","c211288b738ab5e0":"gold-y","5ff7cb74fb8c9f8a":"gold-y","b024cd207997ae2a":"gold-y","4c3234390a9873ff":"gold-y","8e98738fa302efe7":"gold-y","ac39f02f9fb72bc3":"gold-y","2590e59dc879881c":"gold-y","039cae7d1a986e11":"gold-y","d8d3d4a0f4c7e667":"gold-y","72d1d8b7fa982402":"gold-y","147bb744a8a99913":"gold-y","a3d4f97a3452a6f9":"gold-y","b30f57f980518f07":"gold-y","bf8f4385d6e2e295":"gold-y","5aba40f8adb07a6a":"gold-y","8f2a8644ecd97355":"gold-y","ae85985ca2d5bdd6":"gold-y","94260662da04c27a":"gold-y","8d5ece7ac0b28a20":"gold-y","a50e727ceee4c548":"gold-y","ec09d275753cd617":"gold-y","66e362c862fc87e2":"gold-y","dfc32280e294b357":"gold-y","bf786f3cc48ecbde":"gold-y","c3801cc305640ce5":"gold-y","7540c943081ae1f0":"gold-y","0ba51c705104cc05":"gold-y","73703362eb980748":"gold-y","32add4fab8d364ac":"gold-y","7085c390d8bbc88f":"gold-y","f977069a3eb5d51c":"gold-y","6b32cebfde511a94":"gold-y","02535b7708496951":"unlimited-m","a2709b2ecc6fb6cb":"unlimited-m","1f101ef7f84c28bf":"unlimited-m","00e75daed7b5716f":"unlimited-m","b6e2effe4e90238a":"unlimited-m","50a95b97fbb7987d":"unlimited-m","de94cd61d584d3ff":"unlimited-m","11d524e984a06647":"unlimited-m","2a297fc63f9ab423":"unlimited-m","1d82836e21632dcf":"unlimited-m","c6f4f75acf466c11":"unlimited-m","9ca415e76afca63b":"unlimited-m","cbf5d2cf3cfa4365":"unlimited-m","42a388cf6f8476c0":"unlimited-m","81332fdf5a4510d8":"unlimited-m","7a91f023b321fc54":"unlimited-m","f7541fb9ef5dbf0d":"unlimited-m","9211241eb8480db0":"unlimited-m","38a583143dd3e2ff":"unlimited-m","3ef57fea7bf4e78c":"unlimited-m","f905b1d610479279":"unlimited-m","7b7bfae2f38dd0ee":"unlimited-m","b67be098e169a055":"unlimited-m","523722529ec068e3":"unlimited-m","50f2cf17dbe59d65":"unlimited-m","7cea509ede9c5ee1":"unlimited-m","83c4138711824ab0":"unlimited-m","ec7f974f88a22041":"unlimited-m","7e5c0b8a6d920504":"unlimited-m","8afe6794c3b35e72":"unlimited-m","acc41ab8ba94ab6b":"unlimited-m","46347e58f31c938d":"unlimited-m","d8e9af87cd47088a":"unlimited-m","8b11c394f9547215":"unlimited-m","eb3c5cfd062be31b":"unlimited-m","ce60d318c1ac7c22":"unlimited-m","f17d5308d537f651":"unlimited-m","f5597ecf4f89f983":"unlimited-m","6fe700cecca9f713":"unlimited-m","e228ed317496ba1b":"unlimited-m","eda4bd0d50c949e8":"unlimited-m","24e7138c2341bf82":"unlimited-m","c23393f145722482":"unlimited-m","123f4ecc324c3374":"unlimited-m","ad0bdc9d69d71d57":"unlimited-m","6921b6eab4342029":"unlimited-m","44736e7059e3a9bc":"unlimited-m","920ef6dcdbda9151":"unlimited-m","0604f555348df8bb":"unlimited-m","8174dd0fe0c1bc84":"unlimited-m","b2e6b87fc8798e68":"unlimited-m","66fd60a333ee1313":"unlimited-m","3d1cb91a05c8f281":"unlimited-m","ad2ee56d65ffe25a":"unlimited-m","dcd29c1982110e9b":"unlimited-m","abdb8d3939709d22":"unlimited-m","775c299f204a3c48":"unlimited-m","0a6922a422fd36e7":"unlimited-m","5efeb90e740b6e7d":"unlimited-m","18d173b385ceb160":"unlimited-m","1b923b99d33aabbb":"unlimited-y","0a078921ed6a3af2":"unlimited-y","ca6d2fac4fe4c791":"unlimited-y","40e750b145c5471c":"unlimited-y","035165c8c547a043":"unlimited-y","3d12f310d699cc35":"unlimited-y","ae239c0086ef9ce7":"unlimited-y","ccb7261cead40954":"unlimited-y","2bd0e73769eb9e25":"unlimited-y","db1e0b9c5940befe":"unlimited-y","ae5f7c625236b28a":"unlimited-y","95cf1dc61b422ef3":"unlimited-y","c0eaf7328ac57c01":"unlimited-y","bcc4d7aa59b24c1a":"unlimited-y","3ae57dda4d7e0fb2":"unlimited-y","5e703c6c565f2fa0":"unlimited-y","6fa8738a616bf8fa":"unlimited-y","aa89f63f16dcaa94":"unlimited-y","671e8608820def92":"unlimited-y","2216c6acbc3ff912":"unlimited-y","4553ea4cddfa18f1":"unlimited-y","e72223a839ee481e":"unlimited-y","2f849e471d5e2334":"unlimited-y","7ef75b56ea4de76e":"unlimited-y","6cd2f597e1d1ec67":"unlimited-y","17f586b1155348f4":"unlimited-y","5c6e055ec9d2c1b3":"unlimited-y","75dd688ce1f4d9a6":"unlimited-y","3cda26b4a4aa13a6":"unlimited-y","4fb497cf22636173":"unlimited-y","96af244bfa469040":"unlimited-y","11ca378a438b2d13":"unlimited-y","3a6f8cc8cd1ec1a5":"unlimited-y","43e4fe98ee107ae7":"unlimited-y","6adcd5d6f28e8ccf":"unlimited-y","a59cd03d20b5e8f0":"unlimited-y","8be2ed487507f5b9":"unlimited-y","613b7d9a8faebf02":"unlimited-y","36b23b8ce776d88e":"unlimited-y","c291d0d378fe651e":"unlimited-y","228b1dedaaa06f6e":"unlimited-y","ac736b6c149a3a4e":"unlimited-y","3a3a84fd973a8334":"unlimited-y","8018c5ad123c975a":"unlimited-y","90b62ca032005e89":"unlimited-y","5a021e9af647894f":"unlimited-y","be6dd801f3357f4c":"unlimited-y","73cae2590599d680":"unlimited-y","c6c54785860a9531":"unlimited-y","c5ee7aa5ccdf4052":"unlimited-y","8c8ab1cbab2305b6":"unlimited-y","005d23000c87bbc5":"unlimited-y","c03f221a61eba072":"unlimited-y","02b57c67731d6956":"unlimited-y","5b2a8f6621ba8b09":"unlimited-y","855dba7a11676d74":"unlimited-y","60f1b227ca115923":"unlimited-y","7f6b10bd2831e163":"unlimited-y","7d27fe98ad70a2d6":"unlimited-y","57e27d3fc67b4afc":"unlimited-y","0c847e6efc77a282":"addon","f04e6b7b8b0658ae":"addon","590cd7779d2426cd":"addon","508da25df029327d":"addon","81abac08ddcc0eae":"addon","afbc25d8dc1e33e9":"addon","7a5a617dc73d741a":"addon","aa36ba5daf329c49":"addon","7ac1c658e2b75d11":"addon","9033e023cac4a08c":"addon","0b0056c7d80a49cc":"addon","36f71e1e812ae293":"addon","b755c307cf11fc8d":"addon","0761bbe9606b1795":"addon","c6e50cd4dd3ddaf5":"addon","d7883aec51d537e4":"addon","92c3c577ea7d6dde":"addon","00849157f7436c5a":"addon","2e678fd8ada37482":"addon","30d62ea3382be4e7":"addon","3ff8c19c3207f6d0":"addon","dcca7b1444644d70":"addon","e2633f8238fa3f0d":"addon","3cc6a829c3c665a7":"addon","27eea6a7cc586913":"addon","9b4d5e87164e2179":"addon","9a8c36937085363d":"addon","98224c1e29c075eb":"addon","f97f119880ec381e":"addon","4744722ac8d12031":"addon","427463b37063dd18":"addon","0bf0e9ef5818a4ad":"addon","7d62980306f29b78":"addon","76a7828d9fad80ed":"addon","24c200c9c098aa82":"addon","6e01912856b04c01":"addon","ebd1a66424f9e8a2":"addon","8d8e916f02618b5a":"addon","d28adc23169ad08b":"addon","abe5a14eb50d9ca7":"addon","93da69c014f57752":"addon","7de0d848e2c076d2":"addon","afff09c06dc92d7f":"addon","1fcd82419bbd46b4":"addon","fe43f0172efcbbe1":"addon","8180724dc9d79154":"addon","4e6fc5caf80d5f82":"addon","0772158cd3cc48c6":"addon","41b8d3131d13ce38":"addon","d90f2be983cd541f":"addon","88fd6ebc99ade0fe":"addon","f6882b92fa3dfbd8":"addon","68c3f3c4763a9530":"addon","15eaa4480f57b75b":"addon","7e3c38b54a5633e2":"addon","5e373cc62b90d330":"addon","b15fecc2868f2ae4":"addon","b632c9c1d9533489":"addon","2f00edd63a9c4b7e":"addon","0511ec6556ac5994":"addon","8a1f89dbb2182a7d":"report","be90e0f0d0935c3e":"report","72aef75dd04cf7f2":"report","17c4f612d974775b":"report","00be1efc4ea99cd8":"report","57ae8db11bfb1a65":"report","5a7664a1f3d52929":"report","ee7458ef0ed500d4":"report","dced28eb44797700":"report","5f24207ee35f80f1":"report","6776338adbc786d7":"report","e5168f57c41c24c2":"report","9293b3fa6f61cdda":"report","44e6f62487efe520":"report","d7f90b9eb4b65c4f":"report","c0bb6080069d73da":"report","2d1712ec914766de":"report","a17f12f71ca218ec":"report","6c81c0d71a0fe61f":"report","31b60b7410f38c06":"report","2c24b240f4d7ad0f":"report","09be002e77463fd3":"report","5ce87ee8a3844175":"report","8af6b23c6b685b0e":"report","2946b9069206da0c":"report","716d8f2bd77a139b":"report","b1a054ba55468307":"report","e06d599eec9277d2":"report","c2e3a90ed1b66593":"report","b18ba970e090995d":"report","f328b684beea9373":"report","7a84ab655de436ef":"report","fa81ae909451e8d1":"report","307839ee48690c5e":"report","5059f065ea2d9ef8":"report","d57fb1a77dbc3be6":"report","2b0bbbe48f1f55c3":"report","8de247af3ba56c34":"report","3d12a81585f441e5":"report","d0f78b0859c511bd":"report","66f0d763cc3acdaa":"report","b04ff001b39da43f":"report","b4e8d49e2c9b8046":"report","9deadee6e183c6bd":"report","8307551c3d76d6c1":"report","7915623b9b0d9ea5":"report","ef6707e4e615af5e":"report","5d78b7a1d5219eb0":"report","9a0983543465b73e":"report","d84a0cebbd046827":"report","13d436a9c7941644":"report","063c079de0dd2f45":"report","cd30d871f2d02b0c":"report","e23f34d514474ba2":"report","4a179c2802f48c32":"report","57d67cec716b4df2":"report","22df490e3097e4f0":"report","12cd3c6419b377a9":"report","359e672df2d09906":"report","e62c1e3cfe946744":"report","de217e5eb38b8a32":"report","9df265b6c4503188":"report","a92cfc3837572352":"report","9ea5748634d38d3a":"report","04f3209c56c32798":"report","d2a05e799b90be16":"report","2f8855890cc4313e":"report","c074d6510b1460ec":"report","0ae1f7976d9ada8a":"report","92600008fcb260d5":"report","21e6606599ca262a":"report","b0fbd62409c5ad27":"report","e93e9a4886f59869":"report","3d92293c8f0899f5":"report","8cb2da1a0adf627e":"report","6b2635e1df7e0dbf":"report","1dcfb4ad1532393c":"report","8b23c2cb11b883a7":"report","38ae1be046657e5f":"report","0f18a138baf4236b":"report","7e447acaae45e5e9":"report","7ac1310daeeb02f0":"report","645cd42e87ceb8aa":"report","25174108b4cca471":"report","f0b8f4c2d8366a0d":"report","9f0f9f68cb28576e":"report","33dac5ef5dc30f95":"report","91a393c037180eb7":"report","97b640612db028a9":"report","a51dbbfed4a5dfd8":"report","f0d44affc61b27ed":"report","16d414975d261f0b":"report","00f8ae9a5649037e":"report","27fdd11b2e91112e":"report","0ff3454ac7c41707":"report","8bb44af5b873b3b8":"report","54357c83b81b3d4f":"report","291fa759eb904975":"report","7bce6e0968390074":"report","e1362a0ace75f9ae":"report","9d8d211b71586ce5":"reportpack","5fad700a7ddab572":"reportpack","a980a05dcf96ba2f":"reportpack","9ace9a2d22ad22d5":"reportpack","7a817345147fd2a6":"reportpack","d6e3f4073f7aaeb6":"reportpack","1a859fa81eb3149d":"reportpack","f69f078ef25b101e":"reportpack","9d9e40e9fe050cd1":"reportpack","0f3bbc216457df78":"reportpack","019010704dbbe1b6":"reportpack","fe10a457c94fcf55":"reportpack","66724246f1d9e870":"reportpack","17e2dfaee05cf588":"reportpack","06a3e49e18f2611f":"reportpack","b4c370dc6366cb15":"reportpack","73ad936aa59dfabf":"reportpack","b5e31b4505c98ecf":"reportpack","d136f6ffdcfe6c21":"reportpack","89c9464e9f20c2bf":"reportpack","1351c611d27877c3":"reportpack","b638e27232edb411":"reportpack","20084d69dcb55859":"reportpack","6d8444e454e393a4":"reportpack","50c16f5567667236":"reportpack","e951e7c566603ad4":"reportpack","ceed8e43562b5084":"reportpack","a8d42bee9216c0ac":"reportpack","741f8738b84c1e62":"reportpack","b206251233da950c":"reportpack","8e7f47dee644a634":"reportpack","68b51dd8ae9e7fb4":"reportpack","0804d51be541a14f":"reportpack","8deb68f285809df2":"reportpack","c9a6c49bbf94e44f":"reportpack","1a069da929b849de":"reportpack","e57fc0a0da215c68":"reportpack","6aeca08b1fddc979":"reportpack","a65fd82f16052340":"reportpack","46d7949145dbae04":"reportpack","be03ee682b4d66b8":"reportpack","3cdf9300fbc2aa09":"reportpack","fdf2158042e478fb":"reportpack","2d00835fada3f3ec":"reportpack","493dcbbf33a0d432":"reportpack","655ba212ac1a9369":"reportpack","bf64375ed4e6a95b":"reportpack","f084459172728b59":"reportpack","c8ca84e9ba2bd584":"reportpack","0b8c170364b08d73":"reportpack","b66042fba18dfbca":"reportpack","3145998821399d78":"reportpack","67612a6e4d2bdfac":"reportpack","c020fc4cc1c17c72":"reportpack","4b1492219e0d43c8":"reportpack","ecd97cd15fd24c83":"reportpack","d2379c9e02ddde7b":"reportpack","5f6175f187054c4e":"reportpack","ac0d91e7305ff099":"reportpack","ea94e6d4af2182df":"reportpack","1d7380ec4bcfd569":"voicepack","248a603d791c3630":"voicepack","fd950e1a3150da70":"voicepack","6497c4ed131fce64":"voicepack","074f627c2073e050":"voicepack","545de4f71ed901a3":"voicepack","0cce7d6a881c0f8e":"voicepack","11ff98661f8c440f":"voicepack","2ab517721fcbe41b":"voicepack","c7b3a7e4a9fd8eb1":"voicepack","47f71d9c40a696dd":"voicepack","707993f46200373d":"voicepack","f58fa8838ba6a5e4":"voicepack","16c794e7180f9471":"voicepack","83e0d9bcb36d5673":"voicepack","a928574c6ad32d2c":"voicepack","c2a73e5f1515dfb0":"voicepack","a69fa2a2882372c6":"voicepack","c386cc41d533c445":"voicepack","5fd4c4c0c431ba1f":"voicepack","3533ae8342771041":"voicepack","233ed5fa9da1f6bd":"voicepack","eee25f300cc5e176":"voicepack","4892500835b22562":"voicepack","ee610413d78a54ee":"voicepack","5957d69aab8928f2":"voicepack","6b1363f653436d34":"voicepack","c17a8c838e22393b":"voicepack","f9e1bc369f7ca3be":"voicepack","1732132b442d0bcd":"voicepack","75e17e08ba9c67f3":"voicepack","f304c378fc0fe206":"voicepack","cd87a413ebda5c98":"voicepack","a9c55e7cf5407a10":"voicepack","eed6d221214a2273":"voicepack","dff5945689b45d44":"voicepack","39b3f29b2e8cf6c3":"voicepack","febc5864469726d2":"voicepack","de01a41517ef0141":"voicepack","415f1da565864b45":"voicepack","4ec8a62fdbf7147a":"voicepack","091197a198dabac6":"voicepack","f57ead6e8c741795":"voicepack","07173a3e9e238d0a":"voicepack","ecf92a171ff4a5bd":"voicepack","ac490581c9e042d9":"voicepack","aa8767ef3129bb55":"voicepack","2e1af9700a61a468":"voicepack","2294bc6292fe7200":"voicepack","3a4541bcbeef2884":"voicepack","19a3567a10a13957":"voicepack","3cfc040b889c0947":"voicepack","c6325b1a15418047":"voicepack","002498db89c1ef9e":"voicepack","efa037a077914860":"voicepack","11a4ea04a7585db5":"voicepack","73aad78975c115e3":"voicepack","dc141634ea8b19fe":"voicepack","8be5ae4fc19a3d5e":"voicepack","93eb796214a3c10f":"voicepack","a2d428c72b5882ae":"voicepack","1b9c4e9805851946":"voicepack","d5afc1837ce5e59c":"voicepack","20d3dbe054941416":"voicepack","a59454515c0c106f":"voicepack","0e5bf55b005ecf9e":"voicepack","20fe306def93dbeb":"voicepack","e6ec0329e11c6dda":"voicepack","1ec8fe38b831751d":"voicepack","6b434b667e2afa4b":"voicepack","82b871e2dbf574ea":"voicepack","05426ff2023ebd90":"voicepack","35aa6849536b7fa4":"voicepack","d8efea8be083e947":"voicepack","3cdb2147552e9546":"voicepack","11901efa535c4cbb":"voicepack","97e097bfbf495daa":"voicepack","c9d9dd58b35a6ada":"voicepack","e4963c2b774600b3":"voicepack","003eba467f8338e9":"voicepack","bc6115b234923643":"voicepack","d683445dd238ce6d":"voicepack","fb226034a6e8ca7e":"voicepack","3043685560b65595":"voicepack","671abaa3cb9e4303":"voicepack","70c3a72e00d39121":"voicepack","f8b2d1bc7738278e":"voicepack","411d918d934bec87":"voicepack","da177c36dc1d6308":"voicepack","3ff2f2beec6f1c3c":"voicepack","de09f40f2b8d7511":"voicepack","86e454f488aa1eba":"voicepack","44b9bed5d8648731":"voicepack","1879162e3dd9c5ac":"voicepack","b3775b01e55385b1":"voicepack","76f27fd3248bf9d4":"voicepack","8bb7464270dce7df":"voicepack","e43cddc3718f4841":"voicepack","9bd4fffcefa8da17":"voicepack","6ba0622408389fb4":"voicepack","f8ee227d232e0777":"qpack15","0ed492219792c55a":"qpack15","d182bcf0dd1afdee":"qpack15","08bf9c7c5dc213a6":"qpack15","15a681648c157736":"qpack15","9a1701ebc3959b78":"qpack15","9f089c45ced656fc":"qpack15","4348dede9b32ad7c":"qpack15","317cea58403832b8":"qpack15","d673f49ea3ace06a":"qpack15","7974bbfcac056e43":"qpack15","d4ad653500c5f87f":"qpack15","23d22eefea3285f9":"qpack15","8815f218c8417b99":"qpack15","d9ee83beeb68baf8":"qpack15","50db38e85d59203e":"qpack15","00a3dfcebae010ad":"qpack15","4e8b0b49c5093a60":"qpack15","6d3b4cff6e570f6d":"qpack15","f062c8e377820ce8":"qpack15","0467852017f84881":"qpack15","abeba6cfda87096c":"qpack15","915a9ed942d8d6df":"qpack15","46cc0e67c6428f7e":"qpack15","b2b77f8ddc501ce8":"qpack15","788c0e3002eb992d":"qpack15","16878794538e7f77":"qpack15","e691d6022c56de3d":"qpack15","7d55f238f3edbf4c":"qpack15","b36c2a5a95a4eb41":"qpack15","7d55bdb6d03db285":"qpack15","2fd1f68c74b90c88":"qpack15","345ff28473bdb138":"qpack15","2406f7baf267e4ca":"qpack15","22719c55eef2d649":"qpack15","ca6aef14f7ffaef1":"qpack15","e0337f918e2dc7e7":"qpack15","48f30d06a3733807":"qpack15","72b4a1d716023ee9":"qpack15","b926c1b5ccec2d40":"qpack15","ce9878cfb6227a14":"qpack15","222637ec83be9c9f":"qpack15","8ea81b0c91720b24":"qpack15","3c1efb613983f345":"qpack15","fc54fc366df4f6cd":"qpack15","3713c3dab147e4d1":"qpack15","42935a7cf3848918":"qpack15","99906f5a80b84191":"qpack15","db5fe6635ecb5b0a":"qpack15","22e6a80d071a0864":"qpack15","946c570952d38fb0":"qpack15","41a1bf0dc85f365f":"qpack15","f2f7a8ec3ea962a5":"qpack15","e70d0501d9e04b88":"qpack15","fe00a62e3e8e565e":"qpack15","20289b03050056c3":"qpack15","f126a0275b1b5d12":"qpack15","7baa317e942f7af5":"qpack15","95dae49c6a82fad8":"qpack15","e14da7025e08b207":"qpack15","7501d02daec4cfb2":"qpack15","156a07da8b08210d":"qpack15","d550b31ea758321b":"qpack15","be60e25ad4cee096":"qpack15","2c65104200221b9e":"qpack15","2b70181ca3aeeaf7":"qpack15","7d8ed959b8503e9a":"qpack15","eebe6d2b86fbb5e7":"qpack15","2fe176912ce98b94":"qpack15","ddb952e499cab71d":"qpack15","ffd88dd4a1d29323":"qpack15","2c9d6363f4b49c5e":"qpack15","268446d59bbc1faf":"qpack15","8c4c8e24316ab4e9":"qpack15","882f59934eb7e890":"qpack15","e89e0c9decf8a8a6":"qpack15","1501530438d086cf":"qpack15","788e3e404c573a36":"qpack15","8c04eff9533a1b11":"qpack15","fcb6c045991bc8bf":"qpack15","b0f61c22123f8c83":"qpack15","0f8757fc7e890286":"qpack15","29344184cdefcbc7":"qpack15","34572078e0a95064":"qpack15","70e5fd4459aea407":"qpack15","5c609a355950bc5d":"qpack15","e23d2532ad16a70c":"qpack15","6ba6bd9d31c74525":"qpack15","cee9a31da92e1583":"qpack15","d0c6f1e6f8877ac7":"qpack15","d7db4abfa31d5f60":"qpack15","d9bfab2322ac8b0c":"qpack15","86d2812c0a734b7a":"qpack15","5c1f85acd05aecba":"qpack15","5c26b974b74bd8a1":"qpack15","54f63057a9bfd7fa":"qpack15","b918ef7192f32a75":"qpack15","1478d5aa8e0a551d":"qpack15","6b0f42c4c864aa73":"qpack15","fbd0a38b89877794":"qpack15","843d5394bbfcad41":"qpack15","71cf4604f39908c1":"qpack15","df9d7941a56164cd":"qpack15","8942f502b19145a6":"qpack15","e9073eb2906af908":"qpack15","faba814a957ececb":"qpack15","d18ce33e00c7c719":"qpack15","cd7eaf42879442cb":"qpack15","747618e29a3fa361":"qpack15","18de9da0b9c73e74":"qpack15","4d1a695172395a20":"qpack15","92c9bac66edb859f":"qpack15","26ff870df4136ce9":"qpack15","3c18e1951ec086ed":"qpack15","a862af1b1f8762d5":"qpack15","bad6765ace6d407c":"qpack15","ef8af6ecc0fc0591":"qpack15","36c2b1f0a3899c30":"qpack15","6f256c4ac37eef16":"qpack15","e1455670f363cdfa":"qpack15","a3f482998f1634b7":"qpack15","e1806aa2606b6003":"qpack15","10fba8731fe4482b":"qpack15","031db0f5258c7c68":"qpack15","5712d5dfb1dcba8e":"qpack15","d10db335a5f78c5c":"qpack15","37d06b6e4bcb0fc2":"qpack15","1e9362cbd4c7c8f0":"qpack15","9b37ecda9855d407":"qpack15","617281ffe56a699c":"qpack15","0211b6e2a530d17c":"qpack15","e6c11e6309fa0348":"qpack15","26306fa762339e91":"qpack15","895005cd4eb93c95":"qpack15","0b9f8f486b4ced97":"qpack15","e10f40cd9ecdbf98":"qpack15","32dc4ff737730a6d":"qpack15","0a56fc954ed992a3":"qpack15","a1781ed7e9eece5f":"qpack15","e87b535c43e4eadb":"qpack15","e49cbf83e424bc87":"qpack15","72426fd4182308d1":"qpack15","b6edabec3bcd6cce":"qpack15","790e828e0125b108":"qpack15","80ea702eb331f829":"qpack15","7d715479cf6e71de":"qpack15","5a98cf77b9ae0494":"qpack15","20d72bed62f9aaef":"qpack15","e802b96dfa712a0c":"qpack15","f567a91de8a5d455":"qpack15","ef7dcd3735462a69":"qpack40","b400ec3a223aee56":"qpack40","bfb288f12bb596a4":"qpack40","b02a26270bd88ccd":"qpack40","98662f430f15947f":"qpack40","200af081db6ee2f4":"qpack40","d9914e297ccd212b":"qpack40","4de83bd8809e21f0":"qpack40","b343b12e1ef4e721":"qpack40","3d98386a068f9312":"qpack40","b42168e1dc5eedf6":"qpack40","f07e5fcb79c8ed22":"qpack40","36cc3aa5f61f97aa":"qpack40","0bd0564a8898fc07":"qpack40","0dd0b87ca2dfecd1":"qpack40","35e5ff30db732434":"qpack40","948415e153bd0d01":"qpack40","ae4c15b926482d6d":"qpack40","9776cae98504edaa":"qpack40","7b3e3acfec9f1db6":"qpack40","bfae9acd687a91f9":"qpack40","a7f51e42651fc659":"qpack40","d2fc3a580e1d4aef":"qpack40","ae5172b01a9b1be5":"qpack40","528381147fb4694f":"qpack40","3c8ba62a267fa38d":"qpack40","cffa9bf7e907d172":"qpack40","cf468f2aa02b1691":"qpack40","20641c7ae74c7601":"qpack40","08f981d8abc1ea09":"qpack40","0afa5c30ca6fad66":"qpack40","edf245219ccf380e":"qpack40","3ce41919a6ab119a":"qpack40","f1a8705fe66a1b7e":"qpack40","109e8f78b612aff2":"qpack40","cddad3fb5f810774":"qpack40","1c9b3b8d97780065":"qpack40","96c5c2b9aead53ba":"qpack40","f96427d5600a207e":"qpack40","c5bb4d030e32f9c6":"qpack40","6e9a625418bff51d":"qpack40","18d29f934a7e38c6":"qpack40","2b69ffecedc6ce26":"qpack40","c81d04474b0e249f":"qpack40","d842633d932a4d57":"qpack40","3382759525787d4d":"qpack40","00bd03672aedf1be":"qpack40","1810caca912e7a58":"qpack40","fdf1a00feb1b29a1":"qpack40","bd6970da9874a567":"qpack40","f123e762a3e8c1b2":"qpack40","780c8333b06a2efe":"qpack40","eedb3bb1b1244dcb":"qpack40","34e2fb2f864e3777":"qpack40","fc86257c7d1d102e":"qpack40","11a3c8578efbf22b":"qpack40","aa07d31096dde670":"qpack40","fd07276b040761f2":"qpack40","5fd0444f7fef3bc0":"qpack40","586627c4dd87cd8d":"qpack40","c488be7070afad3e":"qpack40","af30f98c1097ca34":"qpack40","f7b31f7656094e45":"qpack40","61d92659a63c65fb":"qpack40","c5b0a4c0f76e1c3e":"qpack40","25b0f8f3dd961309":"qpack40","de0d0578968d0a57":"qpack40","50c2ed0900e5b1e0":"qpack40","df65a2f86a86d03d":"qpack40","b04bc79cce1f392e":"qpack40","04b07c824007ff3a":"qpack40","b5c494afce15b39d":"qpack40","b0ddb333f8d0ef69":"qpack40","8f703c2ccb3fad5a":"qpack40","ca5b6b3ed7661072":"qpack40","ac2b67a760a4c33e":"qpack40","a5d8d0707c2a2ddf":"qpack40","4c6b3301f8d2a864":"qpack40","e246005d93e7cc82":"qpack40","5afe9ba7d83f60e6":"qpack40","980ee5fcd77c2fe8":"qpack40","1ed8ef2a85c961d6":"qpack40","8967561a5e44dcf5":"qpack40","4759074198b83c58":"qpack40","64f6f93d79453396":"qpack40","e5548b62e2b0ed99":"qpack40","481056886b307145":"qpack40","bfa1a1bbaa4e3737":"qpack40","ffd271fcb1a825a1":"qpack40","4e36a262fe375a7c":"qpack40","15e4dada1ad9e696":"qpack40","aeb4b913bb3ddc07":"qpack40","10b7e61eaa697e44":"qpack40","1f125829f8d03dba":"qpack40","46f0fd83b26c908e":"qpack40","373731664c14c950":"qpack40","bf61e96a3f018264":"qpack40","6187fc6c020c7bb1":"qpack40","69402b4a3bd1d774":"qpack40","c70e8ce83615c97c":"qpack40","80b8cc097aa426af":"qpack40","82b9abe2ecf9a9e4":"qpack40","090fb55826eebc87":"qpack40","f0276523762840e2":"qpack40","ee9f7ff2b92f9726":"qpack40","cf7ffa0dde63937f":"qpack40","62af9c41b2700fcf":"qpack40","d61b7cda68daee13":"qpack40","ca2e8fbdcb53575d":"qpack40","a45945d8cd8444d8":"qpack40","a3a2ce4f2a76d3ec":"qpack40","0b0a13177bdc8a9a":"qpack40","f9556054e91be3ec":"qpack40","e816fb18697aae7c":"qpack40","61c5338a343610e4":"qpack40","e28555e8a437bc55":"qpack40","afe6f2fa87734f70":"qpack40","a719a4146f4346f7":"qpack40","55118bfec53627b4":"qpack40","080152b9c11475c9":"qpack40","33d69cd290ad4753":"qpack40","328a165d708086b0":"qpack40","e2279e4a49f7bb10":"qpack40","3ba468126d9c6b97":"qpack40","43440549be75be36":"qpack40","dde8415753d90a94":"qpack40","48d3bcc214eebab7":"qpack40","40a16edf82353f05":"qpack40","350133200b637219":"qpack40","6625edefd44e9960":"qpack40","3d5be09ecb0d7f61":"qpack40","ae355c2afd577248":"qpack40","ed14c64399cfc347":"qpack40","f770f8da80cf214c":"qpack40","688866affacaa16a":"qpack40","930fcd073d31d0c2":"qpack40","caf094550ec21440":"qpack40","3bd8744dea5eee17":"qpack40","de9413eae4fa00d2":"qpack40","06e9a61687ec2be3":"qpack40","bb9dd5ea0775240b":"qpack40","5e043b681beb14de":"qpack40","c697e75c2979e6b0":"qpack40","73894181e72d8b81":"qpack40","2dd8a2d57774001c":"qpack40","d7fef07adbf2c206":"qpack40","62b236a9e7cb1ddd":"qpack40","53b1484bf6a50c46":"qpack40","d6a964d160b986f3":"qpack40","5f09f190413aa5ea":"qpack40"};


const EXAMPLE = { id: "example", name: "Aarav", gender: "M", date: "1990-05-15", time: "10:30", place: "Mumbai, Maharashtra, India", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.076, lon: 72.878, tz: 5.5, example: true };
const EXAMPLE_PARTNER = { id: "example2", name: "Diya", gender: "F", date: "1992-08-24", time: "07:45", place: "New Delhi, Delhi, India", city: "New Delhi", state: "Delhi", country: "India", lat: 28.614, lon: 77.209, tz: 5.5, example: true };

const state = {
  profiles: store.get("profiles", []),
  active: store.get("active", 0),
  tab: "today",
  chat: [],
  sample: null,
  aiBusy: false,
  kmode: "lagna",
  openMd: null,
  openAd: null,
  openPd: null,
  pending: null,
  lang: store.get("lang", "auto"),
  kstyle: store.get("kstyle", null),
  lastSubject: null,
  match: null,
};
const profiles = () => state.profiles.length ? state.profiles : [EXAMPLE];
const prof = () => profiles()[Math.min(state.active, profiles().length - 1)];
const chartCache = new Map();
function chartOf(p) {
  const key = [p.date, p.time, p.tz, p.lat, p.lon].join("|");
  if (!chartCache.has(key)) chartCache.set(key, A.chart(p));
  return chartCache.get(key);
}

/* ---------- plans and usage ---------- */
function planState() {
  const s = store.get("plan", { id: "free" });
  if (s.id !== "free" && s.expires && Date.now() > s.expires) return { id: "free", expired: s.id };
  return PLANS[s.id] ? s : { id: "free" };
}
const curPlan = () => PLANS[planState().id];
const kundliLimit = () => curPlan().kundlis + store.get("addons", 0);
const kundliCount = () => state.profiles.filter(p => !p.example).length;
const monthKey = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };
const usedQ = id => (store.get("use." + monthKey(), {}))[id] || 0;
function addQ(id) { const k = "use." + monthKey(), u = store.get(k, {}); u[id] = (u[id] || 0) + 1; store.set(k, u); }
/* Free: a few free questions per device, then paid question packs. Paid plans: a monthly allowance per kundli, then packs. */
const QPACKS = [{ key: "qpack15", q: 15, price: 49 }, { key: "qpack40", q: 40, price: 99 }];
const qCredits = () => store.get("qCredits", 0);
const freeLeft = () => Math.max(0, PLANS.free.questions - store.get("freeQ", 0));
const qLeft = id => {
  if (planState().id === "free") return freeLeft() + qCredits();
  const L = curPlan().questions; return L === Infinity ? Infinity : Math.max(0, L - usedQ(id)) + qCredits();
};
function consumeQ(id) {
  if (planState().id === "free") { if (freeLeft() > 0) store.set("freeQ", store.get("freeQ", 0) + 1); else store.set("qCredits", Math.max(0, qCredits() - 1)); return; }
  const L = curPlan().questions;
  if (L === Infinity || usedQ(id) < L) addQ(id); else store.set("qCredits", Math.max(0, qCredits() - 1));
}
function qPill(id) {
  const left = qLeft(id);
  if (left === Infinity) return "unlimited questions";
  if (planState().id === "free") return freeLeft() > 0 ? `${freeLeft()} of ${PLANS.free.questions} free questions left` : `${qCredits()} question credit${qCredits() === 1 ? "" : "s"} left`;
  return `${left} questions left this month`;
}
function packButtons() { return QPACKS.map((pk, i) => buyBtn(pk.key, `${pk.q} questions · ₹${pk.price}`, i === 0)).join(""); }
const fmtLimit = n => n === Infinity ? "Unlimited" : String(n);
async function sha16(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].slice(0, 8).map(x => x.toString(16).padStart(2, "0")).join("");
}
async function redeem(raw) {
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return { ok: false, msg: "Enter the activation code you received after payment." };
  const used = store.get("redeemed", []);
  if (used.includes(code)) return { ok: false, msg: "This code is already applied on this device." };
  let key;
  try { key = CODE_HASHES[await sha16("taara:" + code)]; } catch (e) { return { ok: false, msg: "Your browser blocked the check. Please try another browser." }; }
  if (!key) return { ok: false, msg: "That code is not valid. Check it letter by letter, or contact us." };
  used.push(code); store.set("redeemed", used);
  if (key === "addon") { store.set("addons", store.get("addons", 0) + 1); return { ok: true, msg: `Done. You can now save ${fmtLimit(kundliLimit())} kundlis.` }; }
  if (key === "qpack15" || key === "qpack40") { const n = key === "qpack15" ? 15 : 40; store.set("qCredits", qCredits() + n); return { ok: true, msg: `${n} question credits added.` }; }
  if (key === "voicepack") { store.set("voxBonus", store.get("voxBonus", 0) + VOICE_PACK_MIN * 60); return { ok: true, msg: `${VOICE_PACK_MIN} voice minutes added.` }; }
  if (key === "report" || key === "reportpack") { const n = key === "report" ? 1 : 4; store.set("reportCredits", store.get("reportCredits", 0) + n); return { ok: true, msg: `${n} report credit${n > 1 ? "s" : ""} added. Open any report in the Kundli tab to unlock it.` }; }
  const [id, per] = key.split("-"), days = per === "y" ? 365 : 30, cur = planState();
  const base = cur.id === id && cur.expires > Date.now() ? cur.expires : Date.now();
  store.set("plan", { id, expires: base + days * 864e5 });
  return { ok: true, msg: `${PLANS[id].name} plan active until ${new Date(base + days * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.` };
}
function limitMsgKundli() {
  return `Your ${curPlan().name} plan includes ${fmtLimit(kundliLimit())} kundlis and all are in use. Upgrade your plan or add one more kundli for ₹${ADDON_PRICE}.`;
}

/* ---------- ads (own website only, free users only, loaded once outside the re-rendered view) ---------- */
function initAds() {
  const ad = CFG.adsense || {};
  let top = false; try { top = window.self === window.top; } catch (e) {}
  if (!ad.client || !top || planState().id !== "free") return;
  const box = document.getElementById("ad-main"); if (!box) return;
  const s = document.createElement("script"); s.async = true; s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ad.client);
  document.head.appendChild(s);
  box.innerHTML = `<p class="note">Advertisement</p><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ad.client)}"${ad.slot ? ` data-ad-slot="${esc(ad.slot)}"` : ""} data-ad-format="auto" data-full-width-responsive="true"></ins>`;
  box.hidden = false;
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
}

/* ---------- time helpers ---------- */
const deviceTz = () => -new Date().getTimezoneOffset() / 60;
const nowJ = () => A.dateToJd(new Date());
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtJ(J, tz = deviceTz(), withDay = true) {
  const d = A.jdToDate(J + tz / 24);
  return (withDay ? d.getUTCDate() + " " : "") + MON[d.getUTCMonth()] + " " + d.getUTCFullYear();
}
function fmtDateStr(s) { const [y, m, d] = s.split("-").map(Number); return `${d} ${MON[m - 1]} ${y}`; }
function fmtTime(s) { let [h, m] = s.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${String(m).padStart(2, "0")} ${ap}`; }
function fmtH(h) { h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H++; M = 0; } const ap = H >= 12 ? "PM" : "AM"; return `${(H % 12) || 12}:${String(M).padStart(2, "0")} ${ap}`; }
function todayStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function sunTimes(dateStr, lat, lon, tz) {
  const R = Math.PI / 180;
  const J0 = A.jdLocal(dateStr, "12:00", tz);
  const t = A.tropical(J0).Sun, eps = 23.4393;
  const dec = Math.asin(Math.sin(eps * R) * Math.sin(t * R)) / R;
  const ra = A.n360(Math.atan2(Math.cos(eps * R) * Math.sin(t * R), Math.cos(t * R)) / R);
  const L0 = A.n360(280.46646 + 0.98564736 * (J0 - 2451545));
  const eot = ((L0 - 0.0057183 - ra + 540) % 360 - 180) * 4;
  const noon = 12 + tz - lon / 15 - eot / 60;
  const cosH = (Math.sin(-0.833 * R) - Math.sin(lat * R) * Math.sin(dec * R)) / (Math.cos(lat * R) * Math.cos(dec * R));
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / R / 15;
  return { rise: noon - H, set: noon + H, noon };
}

/* ---------- seeded randomness for daily text ---------- */
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const rnd = (seed, k) => (hash(seed + ":" + k) % 10000) / 10000;
const pick = (arr, seed, k) => arr[Math.floor(rnd(seed, k) * arr.length)];

/* ---------- daily reading ---------- */
const MOON_HOUSE = { 1: 60, 2: 48, 3: 80, 4: 38, 5: 54, 6: 78, 7: 74, 8: 28, 9: 58, 10: 82, 11: 90, 12: 32 };
const HOUSE_THEME = { 1: "putting yourself first and starting fresh", 2: "family, food and steady savings", 3: "bold moves, short trips and clear messages", 4: "home, mother and inner calm", 5: "creativity, romance and learning", 6: "clearing tasks, routines and health habits", 7: "partnerships and one-to-one talks", 8: "slowing down and handling private matters", 9: "luck, elders and wise advice", 10: "career visibility and responsibility", 11: "gains, friends and fulfilled wishes", 12: "rest, spiritual practice and watching expenses" };
const TARA = [null, ["Janma", -6, "your birth star; stay balanced"], ["Sampat", 10, "the star of wealth"], ["Vipat", -12, "the star of obstacles"], ["Kshema", 8, "the star of wellbeing"], ["Pratyak", -10, "the star of resistance"], ["Sadhana", 9, "the star of achievement"], ["Naidhana", -14, "the most delicate star"], ["Mitra", 8, "the friendly star"], ["Param Mitra", 11, "the best-friend star"]];
const TXT = {
  love: {
    hi: ["Warmth comes easily today. Say the kind thing you have been holding back.", "Your charm is high. A good day for a date, a call to someone special or mending a small gap.", "Partners feel heard when you listen first. Expect affection in return."],
    mid: ["Feelings are steady. Small gestures matter more than big promises today.", "Keep conversations light. A shared meal or walk brings you closer.", "Give your partner space and they will come closer on their own."],
    lo: ["Moods can swing. Pause before replying to anything that stings.", "Avoid old arguments today. Patience protects what you have built.", "Not the day for big relationship decisions. Let things settle."],
  },
  career: {
    hi: ["Your work gets noticed. Present ideas, ask for what you deserve and follow up.", "Good energy for interviews, pitches and leading a team.", "Finish the pending task first, then take on the new opportunity that shows up."],
    mid: ["Steady progress. Stick to your list and avoid office politics.", "A routine day that rewards discipline. Plan the week ahead.", "Collaborate rather than compete. A colleague may help you unlock a delay."],
    lo: ["Delays are possible. Double-check emails and documents before sending.", "Keep a low profile and avoid confrontations with seniors today.", "Do not sign or commit in a hurry. Use the day for preparation."],
  },
  money: {
    hi: ["Financial luck is on your side. A good day to collect dues or plan an investment.", "Gains can come through contacts. Network a little.", "A favourable day for purchases you have already researched."],
    mid: ["Money stays balanced. Track small expenses.", "Avoid impulse buys. Review your budget and savings goal.", "Steady income day. Not ideal for speculation."],
    lo: ["Expenses may rise. Postpone big purchases and avoid lending money.", "Guard against hasty financial decisions and online offers.", "Keep your wallet closed today and review subscriptions."],
  },
  health: {
    hi: ["Energy is strong. Good for exercise, yoga or starting a new routine.", "You feel light and active. Use it for a long walk or workout.", "Good vitality. A healthy meal and early sleep keep the streak going."],
    mid: ["Energy is moderate. Drink more water and take short breaks.", "Balance work with rest. Stretch between long sitting sessions.", "A normal day. Keep meals regular and avoid late nights."],
    lo: ["Energy may dip. Rest, eat simply and avoid overexertion.", "Stress can show up in the body. Try ten minutes of slow breathing.", "Take it easy today. Skip heavy, oily food and sleep early."],
  },
};
const LUCKY_COLOR = ["Orange", "White", "Red", "Green", "Yellow", "Pink", "Navy blue"];
const LUCKY_NUM = { Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9 };
const DO = { good: ["Start new work", "Sign agreements", "Meet important people", "Buy what you planned", "Ask for support"], bad: ["Avoid big decisions", "Skip arguments", "Postpone major purchases", "Rest more", "Double-check documents"] };

function dailyFor(c, dateStr, tz) {
  const J = A.jdLocal(dateStr, "12:00", tz);
  const tr = A.transits(J);
  const fromMoon = p => ((tr[p].sign - c.moonSign + 12) % 12) + 1;
  const mh = fromMoon("Moon");
  const taraN = ((tr.Moon.nak.idx - c.nak.idx + 27) % 27) % 9 + 1;
  const tara = TARA[taraN];
  const seed = dateStr + c.J.toFixed(3);
  const jit = k => rnd(seed, k) * 12 - 6;
  const g = (p, set, w = 1) => (set.includes(fromMoon(p)) ? 8 : -6) * w;
  const base = MOON_HOUSE[mh], t = tara[1];
  const s = {
    overall: clamp(base + t + jit(0)),
    love: clamp(base * 0.6 + 22 + g("Venus", [1, 2, 3, 4, 5, 8, 9, 11, 12]) + ([5, 7, 11].includes(mh) ? 8 : 0) + t * 0.5 + jit(1)),
    career: clamp(base * 0.6 + 22 + g("Sun", [3, 6, 10, 11]) + g("Saturn", [3, 6, 11], 0.6) + ([3, 10, 11].includes(mh) ? 6 : 0) + t * 0.5 + jit(2)),
    money: clamp(base * 0.6 + 22 + g("Jupiter", [2, 5, 7, 9, 11]) + ([2, 11].includes(mh) ? 8 : 0) + t * 0.5 + jit(3)),
    health: clamp(base * 0.6 + 22 + g("Mars", [3, 6, 11]) + ([6, 8, 12].includes(mh) ? -10 : 4) + t * 0.5 + jit(4)),
  };
  const tier = v => v >= 68 ? "hi" : v >= 45 ? "mid" : "lo";
  const text = {};
  for (const k of ["love", "career", "money", "health"]) text[k] = pick(TXT[k][tier(s[k])], seed, k);
  const pan = A.panchang(J, tz);
  const good = s.overall >= 55;
  return { J, tr, mh, taraN, tara, s, text, pan, fromMoon,
    headline: `The Moon moves through your ${ord(mh)} house from your Moon sign. Today favours ${HOUSE_THEME[mh]}.`,
    lucky: { color: LUCKY_COLOR[pan.weekday], number: LUCKY_NUM[tr.Moon.nak.lord] },
    todo: [pick(DO[good ? "good" : "bad"], seed, "d1"), pick(DO.good.concat(DO.bad).filter(x => x), seed, "d2")].filter((v, i, a) => a.indexOf(v) === i),
  };
}
function saturnStatus(c, tr) {
  const h = ((tr.Saturn.sign - c.moonSign + 12) % 12) + 1;
  if (h === 12) return { tag: "Sade Sati", level: "warn", text: "Rising phase of Sade Sati. Saturn asks for discipline and patience with responsibilities." };
  if (h === 1) return { tag: "Sade Sati", level: "bad", text: "Peak phase of Sade Sati. Hard work pays off slowly. Look after health and avoid shortcuts." };
  if (h === 2) return { tag: "Sade Sati", level: "warn", text: "Setting phase of Sade Sati. Finances and family need careful handling. Relief is near." };
  if (h === 4) return { tag: "Shani Dhaiya", level: "warn", text: "Saturn transits your 4th from Moon. Home matters and peace of mind need attention." };
  if (h === 8) return { tag: "Ashtama Shani", level: "warn", text: "Saturn transits your 8th from Moon. Go slow with risky ventures and protect health." };
  if ([3, 6, 11].includes(h)) return { tag: "Saturn helps", level: "good", text: `Saturn transits your ${ord(h)} from Moon, one of its best positions. Effort turns into results.` };
  return { tag: "No Sade Sati", level: "good", text: `Saturn transits your ${ord(h)} from Moon. No Sade Sati or Dhaiya at present.` };
}

/* ---------- UI shell ---------- */
const TABS = [["today", "Today", "आज"], ["kundli", "Kundli", "कुंडली"], ["ask", "Ask", "प्रश्न"], ["match", "Match", "मिलान"], ["plus", "Plus", "प्लस"]];
function renderNav() {
  const html = TABS.map(([k, en, hi]) => `<button class="tab${state.tab === k ? " on" : ""}" data-tab="${k}" aria-current="${state.tab === k ? "page" : "false"}"><span class="tab-hi" lang="hi">${hi}</span><span>${en}</span></button>`).join("");
  $("#tabs").innerHTML = html;
  const sel = profiles().map((p, i) => `<option value="${i}"${i === state.active ? " selected" : ""}>${esc(p.name)}${p.example ? " (example)" : ""}</option>`).join("");
  $("#who").innerHTML = hasReal() ? `<label class="sr" for="profile-select">Profile</label><select id="profile-select">${sel}</select><button class="btn ghost sm" id="add-profile">+ Add person</button>` : `<button class="btn sm" data-act="start">Get free Kundli</button>`;
}
const hasReal = () => state.profiles.length > 0;
function render() {
  renderNav();
  const v = $("#view");
  if (!hasReal() && ["today", "kundli", "ask"].includes(state.tab)) v.innerHTML = viewWelcome();
  else if (state.tab === "today") v.innerHTML = viewToday();
  else if (state.tab === "kundli") v.innerHTML = viewKundli();
  else if (state.tab === "ask") { v.innerHTML = viewAsk(); scrollChat(); }
  if (state.tab === "match") v.innerHTML = viewMatch();
  if (state.tab === "plus") v.innerHTML = viewPlus();
  try { if (location.hash.slice(1) !== state.tab) history.replaceState(null, "", "#" + state.tab); } catch (e) {}
}

function exampleBanner(p) {
  return p.example ? `<div class="banner"><div><strong>You are viewing an example chart.</strong> Add your birth details to see your own Kundli, daily reading and timelines.</div><button class="btn" data-act="add">Add my birth details</button></div>` : "";
}
function meter(label, v) {
  const lvl = v >= 68 ? "good" : v >= 45 ? "warn" : "bad";
  return `<div class="meter"><div class="meter-top"><span>${label}</span><span class="num">${v}</span></div><div class="bar"><i class="${lvl}" style="width:${v}%"></i></div></div>`;
}

/* ---------- Welcome: first visit, no example data, just the birth form ---------- */
const ZOD = "♈♉♊♋♌♍♎♏♐♑♒♓";
function heroArt() {
  const pt = (r, a) => [300 + r * Math.cos((a - 90) * Math.PI / 180), 300 + r * Math.sin((a - 90) * Math.PI / 180)].map(n => n.toFixed(1));
  const spokes = Array.from({ length: 12 }, (_, i) => { const [x1, y1] = pt(118, i * 30), [x2, y2] = pt(272, i * 30); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join("");
  const glyphs = [...ZOD].map((g, i) => { const [x, y] = pt(244, i * 30 + 15); return `<text x="${x}" y="${y}">${g}︎</text>`; }).join("");
  const ticks = Array.from({ length: 72 }, (_, i) => { const [x1, y1] = pt(272, i * 5), [x2, y2] = pt(i % 6 ? 279 : 286, i * 5); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join("");
  const spark = (x, y, r, o) => `<path d="M${x} ${y - r}L${x + r * .22} ${y - r * .22}L${x + r} ${y}L${x + r * .22} ${y + r * .22}L${x} ${y + r}L${x - r * .22} ${y + r * .22}L${x - r} ${y}L${x - r * .22} ${y - r * .22}Z" opacity="${o}"/>`;
  return `<svg class="wart" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="wglow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#c9f3ff" stop-opacity=".75"/><stop offset=".22" stop-color="#58c4ff" stop-opacity=".32"/><stop offset=".6" stop-color="#2a5bd7" stop-opacity=".12"/><stop offset="1" stop-color="#0a1630" stop-opacity="0"/></radialGradient>
    <linearGradient id="wcrys" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2fcff"/><stop offset=".45" stop-color="#9fe2ff"/><stop offset="1" stop-color="#6a7dff"/></linearGradient>
  </defs>
  <circle cx="300" cy="300" r="300" fill="url(#wglow)"/>
  <g class="spin" fill="none" stroke="#9fdcff" stroke-opacity=".45" stroke-width="1.2">
    <circle cx="300" cy="300" r="286"/><circle cx="300" cy="300" r="272"/><circle cx="300" cy="300" r="216"/><circle cx="300" cy="300" r="118"/>
    <g stroke-opacity=".5">${ticks}</g><g stroke-opacity=".3">${spokes}</g>
    <g class="zg" fill="#cdeeff" fill-opacity=".85" stroke="none">${glyphs}</g>
  </g>
  <g class="spin rev" fill="none" stroke="#bfeaff" stroke-opacity=".35"><polygon points="${[0, 1, 2, 3, 4, 5].map(i => pt(170, i * 60).join(",")).join(" ")}"/><polygon points="${[0, 1, 2, 3, 4, 5].map(i => pt(170, i * 60 + 30).join(",")).join(" ")}"/></g>
  <g class="crys" opacity=".6">
    <polygon points="300,196 344,236 344,350 300,404 256,350 256,236" fill="url(#wcrys)" opacity=".95"/>
    <g fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="1.2"><polyline points="256,236 300,262 344,236"/><line x1="300" y1="262" x2="300" y2="404"/><polyline points="256,350 300,330 344,350" stroke-opacity=".35"/><line x1="300" y1="196" x2="300" y2="262" stroke-opacity=".4"/></g>
    <polygon points="300,196 344,236 300,262 256,236" fill="#ffffff" opacity=".55"/>
  </g>
  <g fill="#ffffff">${spark(470, 110, 14, .9)}${spark(118, 128, 9, .8)}${spark(486, 170, 12, .85)}${spark(470, 448, 8, .7)}${spark(142, 462, 11, .75)}${spark(388, 88, 6, .7)}${spark(60, 300, 6, .6)}${spark(548, 318, 7, .6)}</g>
</svg>`;
}
const FEATS = [
  ["kundli", "Janam Kundli", "जन्म कुंडली", "North and South Indian charts, yogas, doshas and your full dasha timeline.", '<rect x="4" y="4" width="24" height="24" rx="2"/><path d="M4 4l24 24M28 4L4 28M16 4L4 16l12 12 12-12z"/>'],
  ["today", "Daily rashifal", "दैनिक राशिफल", "Your day score for love, career, money and health, with Panchang and Rahu Kaal.", '<circle cx="16" cy="16" r="6"/><path d="M16 2v5M16 25v5M2 16h5M25 16h5M6 6l3.5 3.5M22.5 22.5L26 26M26 6l-3.5 3.5M9.5 22.5L6 26"/>'],
  ["ask", "Ask the astrologer", "प्रश्न पूछें", "Career, marriage, children, health: answers from your chart with exact dates.", '<path d="M5 6h22v15H14l-6 5v-5H5z"/><path d="M11 12h10M11 16h6"/>'],
  ["match", "Kundli milan", "गुण मिलान", "36-guna matching with Mangal, Nadi and Bhakoot dosha checks.", '<circle cx="12" cy="17" r="7"/><circle cx="20" cy="17" r="7"/><path d="M13 6l3-3 3 3"/>'],
];
function viewWelcome() {
  const t = state.tab;
  const title = t === "ask" ? "Tell us your birth details to start asking" : t === "kundli" ? "Enter birth details to draw your Kundli" : "Get your free Kundli";
  const blank = { name: "", gender: "", date: "", time: "", place: "", country: "India", state: "", city: "" };
  return `${invitedBanner()}
  <section class="welcome">
    <div class="whero">${heroArt()}
      <p class="wbrand">SPATIK ASTRO</p>
      <h1>Crystal-clear astrology<br>in your language</h1>
      <p class="lede">Free Janam Kundli, daily rashifal and an AI astrologer that reads your own chart and answers with exact dates.</p>
      <ul class="trust"><li>Free Kundli</li><li>${LANGS.length - 2} Indian languages</li><li>${CFG.freeQuestions ?? 5} free questions</li><li>Private to you</li></ul>
    </div>
    <section class="card startcard" aria-labelledby="ftitle">
      <h2 id="ftitle">${title}</h2>
      <form id="pform" novalidate>${formFields(blank, false)}
        <p class="err" id="f-err" role="alert"></p>
        <button class="btn big" type="button" data-act="save-profile">Show my Kundli</button>
        <p class="note center">Takes 20 seconds. Your details stay on this device.</p>
      </form>
    </section>
  </section>
  <section class="feats" aria-label="What you get">${FEATS.map(([k, en, hi, txt, ic]) => `<button class="feat" type="button" ${k === "match" ? 'data-tab="match"' : `data-act="start" data-then="${k}"`}><svg viewBox="0 0 32 32" aria-hidden="true">${ic}</svg><b>${en}</b><span class="hi" lang="hi">${hi}</span><span class="ftxt">${txt}</span></button>`).join("")}</section>
  <ol class="steps"><li><b>Enter birth details</b><span>Date, time and place of birth.</span></li><li><b>See your chart and today</b><span>Kundli, dasha and day score in seconds.</span></li><li><b>Ask anything</b><span>Type or speak in your own language.</span></li></ol>`;
}
function startHere(then) {
  if (then) state.after = then;
  if (hasReal()) { if (then) { state.tab = then; render(); window.scrollTo(0, 0); } return; }
  if (!$("#pform") || !$("#modal").hidden) { closeForm(); if (!["today", "kundli", "ask"].includes(state.tab)) state.tab = "today"; render(); }
  const el = $("#f-name"); if (!el) return;
  try { $(".startcard").scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  setTimeout(() => el.focus({ preventScroll: true }), 250);
}

/* ---------- Today ---------- */
function viewToday() {
  const p = prof(), c = chartOf(p), tz = deviceTz(), ds = todayStr();
  const d = dailyFor(c, ds, tz);
  const st = sunTimes(ds, p.lat, p.lon, tz);
  const dayLen = st.set - st.rise, seg = [8, 2, 7, 5, 6, 4, 3][d.pan.weekday];
  const rk = st.rise + (seg - 1) * dayLen / 8;
  const cur = A.currentDasha(c, nowJ());
  const sat = saturnStatus(c, d.tr);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const s = todayStr(i), dd = dailyFor(c, s, tz);
    const dt = new Date(Date.now() + i * 86400000);
    week.push({ label: i === 0 ? "Today" : dt.toLocaleDateString("en-IN", { weekday: "short" }), date: dt.getDate(), v: dd.s.overall });
  }
  const lvl = v => v >= 68 ? "good" : v >= 45 ? "warn" : "bad";
  const tj = ((d.tr.Jupiter.sign - c.moonSign + 12) % 12) + 1, tra = ((d.tr.Rahu.sign - c.moonSign + 12) % 12) + 1;
  return `${invitedBanner()}${exampleBanner(p)}
  <section class="hero">
    <div>
      <p class="eyebrow">${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      <h1>Namaste, ${esc(p.name)}</h1>
      <p class="lede">${d.headline}</p>
      <div class="chips">
        <span class="chip">Moon sign <b>${A.SIGNS[c.moonSign]}</b> <span lang="hi">${A.SIGNS_HI[c.moonSign]}</span></span>
        <span class="chip">Nakshatra <b>${c.nak.name}</b> pada ${c.nak.pada}</span>
        <span class="chip">Lagna <b>${A.SIGNS[c.lagna.sign]}</b>${p.unknownTime ? " (approx.)" : ""}</span>
      </div>
    </div>
    <div class="score-ring ${lvl(d.s.overall)}" style="--v:${d.s.overall}">
      <div><span class="big num">${d.s.overall}</span><span class="small">day score</span></div>
    </div>
  </section>

  <div class="grid">
    <section class="card span2">
      <h2>Your day <span class="hi" lang="hi">दैनिक राशिफल</span></h2>
      <div class="areas">
        ${["love", "career", "money", "health"].map(k => `<div class="area">${meter(k[0].toUpperCase() + k.slice(1), d.s[k])}<p>${d.text[k]}</p></div>`).join("")}
      </div>
      <div class="tara">Today's Moon is in <b>${d.pan.nak.name}</b>, the <b>${d.tara[0]} Tara</b> from your birth star (${d.tara[2]}).</div>
      <div class="row-actions"><button class="btn ghost" data-act="share-day">Copy today's reading</button><span class="copied" id="copied-day" role="status"></span></div>
    </section>

    <section class="card">
      <h2>Lucky for you</h2>
      <dl class="kv">
        <dt>Colour</dt><dd>${d.lucky.color}</dd>
        <dt>Number</dt><dd class="num">${d.lucky.number}</dd>
        <dt>Best time (Abhijit)</dt><dd>${fmtH(st.noon - 0.4)} – ${fmtH(st.noon + 0.4)}</dd>
        <dt>Avoid (Rahu Kaal)</dt><dd>${fmtH(rk)} – ${fmtH(rk + dayLen / 8)}</dd>
        <dt>Do</dt><dd>${d.todo.join(" · ")}</dd>
      </dl>
    </section>

    <section class="card">
      <h2>Panchang <span class="hi" lang="hi">पंचांग</span></h2>
      <dl class="kv">
        <dt>Tithi</dt><dd>${d.pan.paksha} ${d.pan.tithi}</dd>
        <dt>Nakshatra</dt><dd>${d.pan.nak.name}</dd>
        <dt>Yoga</dt><dd>${d.pan.yoga}</dd>
        <dt>Karana</dt><dd>${d.pan.karana}</dd>
        <dt>Vara</dt><dd>${d.pan.vara}</dd>
        <dt>Sunrise / Sunset</dt><dd>${fmtH(st.rise)} / ${fmtH(st.set)}</dd>
      </dl>
      <p class="note">For ${esc(p.place || "your birth place")}, at noon your time. Moon ${d.pan.illum}% lit.</p>
    </section>

    <section class="card">
      <h2>Your period <span class="hi" lang="hi">दशा</span></h2>
      ${cur ? `<p class="dasha-now"><b>${cur.md.lord}–${cur.ad.lord}–${cur.pd.lord}–${cur.sd.lord}</b></p>
      <dl class="kv levels">
        <dt>Mahadasha</dt><dd><b>${cur.md.lord}</b> until ${fmtJ(cur.md.end, tz, false)}</dd>
        <dt>Antardasha</dt><dd><b>${cur.ad.lord}</b> until ${fmtJ(cur.ad.end)}</dd>
        <dt>Pratyantar</dt><dd><b>${cur.pd.lord}</b> until ${fmtJ(cur.pd.end)}</dd>
        <dt>Sukshma</dt><dd><b>${cur.sd.lord}</b> until ${fmtJ(cur.sd.end)}</dd>
      </dl>
      <div class="bar thin" title="Progress through ${cur.md.lord} Mahadasha"><i class="accent" style="width:${Math.round((nowJ() - cur.md.start) / (cur.md.end - cur.md.start) * 100)}%"></i></div>` : "<p>Outside the 120-year cycle.</p>"}
      <button class="btn ghost sm" data-goto="kundli">See full timeline</button>
    </section>

    <section class="card">
      <h2>Big transits <span class="hi" lang="hi">गोचर</span></h2>
      <ul class="transits">
        <li><span class="pill ${sat.level}">${sat.tag}</span> ${sat.text}</li>
        <li><span class="pill ${[2, 5, 7, 9, 11].includes(tj) ? "good" : "warn"}">Jupiter</span> In ${A.SIGNS[d.tr.Jupiter.sign]}${d.tr.Jupiter.retro ? " (retrograde)" : ""}, your ${ord(tj)} from Moon. ${[2, 5, 7, 9, 11].includes(tj) ? "Growth and blessings flow." : "Blessings come with effort."}</li>
        <li><span class="pill ${[3, 6, 11].includes(tra) ? "good" : "warn"}">Rahu</span> In ${A.SIGNS[d.tr.Rahu.sign]}, your ${ord(tra)} from Moon. ${[3, 6, 11].includes(tra) ? "Supports ambition and bold moves." : "Watch for confusion and shortcuts."}</li>
      </ul>
    </section>

    ${upcomingCard(c, p)}
    <section class="card span2">
      <h2>Your week ahead</h2>
      <div class="week">${week.map(w => `<div class="day"><span class="muted">${w.label}</span><span class="d">${w.date}</span><div class="col"><i class="${lvl(w.v)}" style="height:${w.v}%"></i></div><span class="num">${w.v}</span></div>`).join("")}</div>
    </section>
  </div>`;
}

/* ---------- Kundli ---------- */
const HPOS = { 1: [.5, .25], 2: [.25, .1], 3: [.1, .25], 4: [.25, .5], 5: [.1, .75], 6: [.25, .9], 7: [.5, .75], 8: [.75, .9], 9: [.9, .75], 10: [.75, .5], 11: [.9, .25], 12: [.75, .1] };
const NPOS = { 1: [.5, .45], 2: [.25, .21], 3: [.21, .25], 4: [.45, .5], 5: [.21, .75], 6: [.25, .79], 7: [.5, .55], 8: [.75, .79], 9: [.79, .75], 10: [.55, .5], 11: [.79, .25], 12: [.75, .21] };
function northChart(c, mode) {
  const S = 320, ref = mode === "moon" ? c.moonSign : c.lagna.sign;
  const houses = {}; for (let h = 1; h <= 12; h++) houses[h] = [];
  if (mode !== "moon") houses[1].push("Asc");
  else houses[((c.lagna.sign - ref + 12) % 12) + 1].push("Asc");
  for (const k of A.PLANETS) {
    const pl = c.planets[k], h = ((pl.sign - ref + 12) % 12) + 1;
    houses[h].push(A.ABBR[k] + (pl.retro && k !== "Rahu" && k !== "Ketu" ? "℞" : ""));
  }
  let t = "";
  for (let h = 1; h <= 12; h++) {
    const [nx, ny] = NPOS[h];
    t += `<text x="${nx * S}" y="${ny * S + 4}" class="sn">${((ref + h - 1) % 12) + 1}</text>`;
    const items = houses[h], tri = ![1, 4, 7, 10].includes(h);
    const lines = []; const per = tri ? 2 : 3;
    for (let i = 0; i < items.length; i += per) lines.push(items.slice(i, i + per).join(" "));
    const [x, y] = HPOS[h];
    const lh = 15, y0 = y * S - (lines.length - 1) * lh / 2 + 5;
    lines.forEach((ln, i) => {
      const cls = ln.includes("Asc") ? "pl asc" : "pl";
      t += `<text x="${x * S}" y="${y0 + i * lh}" class="${cls}">${ln}</text>`;
    });
  }
  return `<svg viewBox="0 0 ${S} ${S}" class="nchart" role="img" aria-label="North Indian ${mode === "moon" ? "Moon" : "Lagna"} chart">
    <rect x="1" y="1" width="${S - 2}" height="${S - 2}" />
    <line x1="1" y1="1" x2="${S - 1}" y2="${S - 1}"/><line x1="${S - 1}" y1="1" x2="1" y2="${S - 1}"/>
    <polygon points="${S / 2},1 ${S - 1},${S / 2} ${S / 2},${S - 1} 1,${S / 2}" />${t}</svg>`;
}
const SOUTH_POS = { 11: [0, 0], 0: [1, 0], 1: [2, 0], 2: [3, 0], 3: [3, 1], 4: [3, 2], 5: [3, 3], 6: [2, 3], 7: [1, 3], 8: [0, 3], 9: [0, 2], 10: [0, 1] };
const SIGN_AB = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
function southChart(c, mode) {
  const S = 320, cell = S / 4, items = {};
  for (let s = 0; s < 12; s++) items[s] = [];
  items[c.lagna.sign].push("Asc");
  for (const k of A.PLANETS) { const pl = c.planets[k]; items[pl.sign].push(A.ABBR[k] + (pl.retro && k !== "Rahu" && k !== "Ketu" ? "℞" : "")); }
  const ref = mode === "moon" ? c.moonSign : c.lagna.sign;
  let t = "";
  for (let s = 0; s < 12; s++) {
    const [cx, cy] = SOUTH_POS[s], x = cx * cell, y = cy * cell;
    t += `<rect x="${x + 1}" y="${y + 1}" width="${cell - 2}" height="${cell - 2}" class="${s === ref ? "refcell" : ""}"/>`;
    t += `<text x="${x + 9}" y="${y + 16}" class="sn" text-anchor="start">${SIGN_AB[s]}</text>`;
    if (s === c.lagna.sign) t += `<line x1="${x + 1}" y1="${y + 24}" x2="${x + 24}" y2="${y + 1}" class="ascmark"/>`;
    const lines = []; for (let i = 0; i < items[s].length; i += 2) lines.push(items[s].slice(i, i + 2).join(" "));
    const y0 = y + cell / 2 - (lines.length - 1) * 7.5 + 6;
    lines.forEach((ln, i) => { t += `<text x="${x + cell / 2}" y="${y0 + i * 15}" class="${ln.includes("Asc") ? "pl asc" : "pl"}">${ln}</text>`; });
  }
  t += `<text x="${S / 2}" y="${S / 2 - 6}" class="mid">${mode === "moon" ? "Chandra" : "Rasi"}</text><text x="${S / 2}" y="${S / 2 + 14}" class="sn">South Indian</text>`;
  return `<svg viewBox="0 0 ${S} ${S}" class="nchart south" role="img" aria-label="South Indian ${mode === "moon" ? "Moon" : "Rasi"} chart">${t}</svg>`;
}
function chartStyle() { if (state.kstyle) return state.kstyle; const L = LANG[state.lang]; return L ? L.chart : "north"; }
function signatureCard(c, p) {
  const s = signature(c, p);
  return `<section class="card span2 sigcard">
    <h2>${esc(p.name)}'s cosmic signature <span class="hi" lang="hi">जन्म पहचान</span></h2>
    <div class="sig">
      <div><span class="lbl">Birth star</span><b>${s.nak}</b><p>Ruled by ${s.ni[0]}. Symbol: ${s.ni[1]}. Gift: ${s.ni[2]}.</p></div>
      <div><span class="lbl">Lagna</span><b>${A.SIGNS[c.lagna.sign]}</b><p>You are ${s.lagnaTrait}.</p></div>
      <div><span class="lbl">Power planet</span><b>${s.pp.planet}</b><p>${(() => { const d = dignity(c, s.pp.planet), h = c.planets[s.pp.planet].house; return `${d === "exalted" ? "Exalted" : d === "own" ? "In its own sign" : "Strongly placed"} in your ${ord(h)} house, it gives you ${PLANET_GIFT[s.pp.planet]}.`; })()}</p></div>
    </div>
    ${s.ys.length ? `<ul class="transits">${s.ys.map(y => `<li><span class="pill good">${y.name}</span> ${y.text[0].toUpperCase() + y.text.slice(1)}</li>`).join("")}</ul>` : `<p class="muted">None of the classic yogas we check are present. Your strength comes from your power planet and dasha timing.</p>`}
  </section>`;
}
function viewKundli() {
  const p = prof(), c = chartOf(p), J = nowJ(), cur = A.currentDasha(c, J), tz = deviceTz();
  const rows = [["Lagna", c.lagna, null]].concat(A.PLANETS.map(k => [k, c.planets[k], k]));
  const dz = c.doshas;
  const mg = dz.manglik.lagna || dz.manglik.moon;
  return `${exampleBanner(p)}
  <div class="grid">
    ${signatureCard(c, p)}
    ${reportsCard(p)}
    <section class="card">
      <div class="card-head"><h2>Birth chart <span class="hi" lang="hi">जन्म कुंडली</span></h2>
        <div class="row-actions"><div class="seg" role="group" aria-label="Chart style"><button class="${chartStyle() === "north" ? "on" : ""}" data-kstyle="north">North</button><button class="${chartStyle() === "south" ? "on" : ""}" data-kstyle="south">South</button></div>
        <div class="seg" role="group" aria-label="Chart type"><button class="${state.kmode === "lagna" ? "on" : ""}" data-kmode="lagna">Lagna</button><button class="${state.kmode === "moon" ? "on" : ""}" data-kmode="moon">Moon</button></div></div></div>
      ${chartStyle() === "south" ? southChart(c, state.kmode) : northChart(c, state.kmode)}
      <p class="note">${esc(p.name)} · ${fmtDateStr(p.date)}, ${p.unknownTime ? "time unknown (noon used)" : fmtTime(p.time)} · ${esc(p.place || `${p.lat}, ${p.lon}`)}. ${chartStyle() === "south" ? "South Indian style (fixed signs, Lagna marked with a slash)" : "North Indian style"}, Lahiri ayanamsa ${A.fmtDeg(A.ayanamsa(c.J))}. ℞ marks retrograde.</p>
    </section>
    <section class="card">
      <h2>Planet positions</h2>
      <div class="tablewrap"><table class="ptable">
        <thead><tr><th>Graha</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>House</th></tr></thead>
        <tbody>${rows.map(([k, x]) => `<tr><td><b>${k}</b>${x.retro && k !== "Rahu" && k !== "Ketu" ? ' <span class="r">℞</span>' : ""}</td><td>${A.SIGNS[x.sign]}</td><td class="num">${x.deg}</td><td>${x.nak.name} ${x.nak.pada}</td><td class="num">${x.house || 1}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>
    <section class="card">
      <h2>Doshas <span class="hi" lang="hi">दोष</span></h2>
      <ul class="transits">
        <li><span class="pill ${mg ? "warn" : "good"}">${mg ? "Manglik" : "Not Manglik"}</span> Mars is in the ${ord(dz.manglik.houseL)} house from Lagna and ${ord(dz.manglik.houseM)} from Moon. ${mg ? `Manglik from ${dz.manglik.lagna && dz.manglik.moon ? "both Lagna and Moon" : dz.manglik.lagna ? "Lagna" : "Moon"}. Matching with another Manglik chart balances it.` : "No Mangal dosha."}</li>
        <li><span class="pill ${dz.kaalSarp ? "warn" : "good"}">${dz.kaalSarp ? "Kaal Sarp" : "No Kaal Sarp"}</span> ${dz.kaalSarp ? "All seven planets sit on one side of the Rahu–Ketu axis. Results usually improve after age 33." : "Planets are spread on both sides of the Rahu–Ketu axis."}</li>
        <li><span class="pill ${saturnStatus(c, A.transits(J)).level}">${saturnStatus(c, A.transits(J)).tag}</span> ${saturnStatus(c, A.transits(J)).text}</li>
      </ul>
    </section>
    <section class="card">
      <h2>Vimshottari Dasha <span class="hi" lang="hi">विंशोत्तरी दशा</span></h2>
      <p class="note">Tap a period to open its Antardashas, then Pratyantardashas and Sukshma dashas. Your birth balance came from ${c.nak.name} (ruled by ${c.nak.lord}).</p>
      <ol class="dasha">${c.dasha.map((m, i) => {
        const isCur = cur && m === cur.md, open = state.openMd === i || (state.openMd === null && isCur);
        return `<li class="${isCur ? "cur" : ""}"><button data-md="${i}" aria-expanded="${open}"><b>${m.lord}</b><span class="muted">${fmtJ(Math.max(m.start, c.J), tz, false)} – ${fmtJ(m.end, tz, false)}</span>${isCur ? '<span class="pill good">Now</span>' : ""}</button>
        ${open ? `<ul class="ads">${m.ads.map((ad, j) => {
          const kA = i + "-" + j, isA = cur && ad === cur.ad, oA = state.openAd === kA || (state.openAd === null && isA);
          return `<li class="${isA ? "cur" : ""}"><button class="sub" data-ad="${kA}" aria-expanded="${oA}"><span>${ad.lord} <small>AD</small></span><span class="muted">${fmtJ(ad.start, tz)} – ${fmtJ(ad.end, tz)}</span></button>
          ${oA ? `<ul class="ads lvl3">${A.subPeriods(ad).map((pd, k) => {
            const kP = kA + "-" + k, isP = cur && isA && pd.lord === cur.pd.lord && Math.abs(pd.start - cur.pd.start) < 1e-6, oP = state.openPd === kP || (state.openPd === null && isP);
            return `<li class="${isP ? "cur" : ""}"><button class="sub" data-pd="${kP}" aria-expanded="${oP}"><span>${pd.lord} <small>PD</small></span><span class="muted">${fmtJ(pd.start, tz)} – ${fmtJ(pd.end, tz)}</span></button>
            ${oP ? `<ul class="ads lvl4">${A.subPeriods(pd).map(sd => { const isS = isP && sd.lord === cur.sd.lord && Math.abs(sd.start - cur.sd.start) < 1e-6; return `<li class="${isS ? "cur" : ""}"><span>${sd.lord} <small>SD</small></span><span class="muted">${fmtJ(sd.start, tz)} – ${fmtJ(sd.end, tz)}</span></li>`; }).join("")}</ul>` : ""}</li>`;
          }).join("")}</ul>` : ""}</li>`;
        }).join("")}</ul>` : ""}</li>`;
      }).join("")}</ol>
    </section>
  </div>`;
}

/* ---------- Ask the stars ---------- */
const TOPICS = [
  { key: "admission", label: "admission and higher studies", words: ["admission", "admit", "college", "university", "institute", "seat", "iit", "iim", "nlu", "law school", "aiims", "mbbs", "campus", "get into", "clat"], houses: [9, 4, 5], karaka: ["Jupiter", "Mercury"] },
  { key: "career", label: "career", words: ["career", "job", "work", "promotion", "business", "naukri", "office", "boss", "startup", "interview", "government"], houses: [10, 6], karaka: ["Saturn", "Sun", "Mercury"] },
  { key: "marriage", label: "marriage and love", words: ["marri", "shaadi", "shadi", "spouse", "wife", "husband", "partner", "wedding", "love", "relationship", "girlfriend", "boyfriend", "vivah", "breakup"], houses: [7, 5], karaka: ["Venus", "Jupiter"] },
  { key: "money", label: "money", words: ["money", "wealth", "financ", "income", "salary", "paisa", "rich", "invest", "loan", "debt", "dhan", "stock"], houses: [2, 11], karaka: ["Jupiter", "Venus"] },
  { key: "health", label: "health", words: ["health", "healthy", "disease", "ill", "illness", "sick", "bimar", "bimari", "surgery", "operation", "recover", "fitness", "stress", "sehat", "anxiety", "weight"], houses: [1, 6], karaka: ["Sun", "Mars"] },
  { key: "education", label: "studies", words: ["study", "exam", "education", "degree", "padhai", "result", "neet", "jee", "upsc", "competitive"], houses: [5, 4], karaka: ["Mercury", "Jupiter"] },
  { key: "children", label: "children", words: ["child", "baby", "kids", "son", "daughter", "pregnan", "santan", "bachch"], houses: [5], karaka: ["Jupiter"] },
  { key: "travel", label: "travel and settling abroad", words: ["abroad", "foreign", "travel", "visa", "settle", "videsh", "relocat", "canada", "usa", "uk", "australia"], houses: [12, 9], karaka: ["Rahu", "Moon"] },
  { key: "property", label: "home and property", words: ["house", "home", "property", "land", "flat", "car", "vehicle", "ghar", "makaan"], houses: [4], karaka: ["Mars", "Moon", "Venus"] },
];
const REMEDY = { Sun: "Offer water to the rising Sun and keep your word on small promises.", Moon: "Spend Monday evenings with family and keep a regular sleep routine.", Mars: "Recite the Hanuman Chalisa on Tuesdays and channel energy into exercise.", Mercury: "Learn one new skill this month and donate green moong on Wednesdays.", Jupiter: "Respect teachers and elders, and donate yellow dal or books on Thursdays.", Venus: "Keep your space clean and beautiful, and support women in need on Fridays.", Saturn: "Help workers and the elderly, and donate black sesame on Saturdays.", Rahu: "Meditate for ten minutes daily and avoid shortcuts or half-truths.", Ketu: "Spend quiet time in prayer or nature, and feed stray dogs." };
const SUGGEST = ["When will I get a new job?", "When will I get married?", "Will my son get admission to his dream college?", "How will 2027 be for my finances?", "Should I start my own business?", "Is going abroad in my chart?", "What does my current dasha mean?"];

function viewAsk() {
  const p = prof(), ai = !!state.sample;
  const Lc = state.lang === "auto" ? null : LANG[state.lang];
  const msgs = state.chat.length ? state.chat : [{ role: "assistant", content: `${Lc ? Lc.hello : "Namaste"} ${p.name}. I am Spatik${Lc && Lc.code !== "en" ? `, your ${Lc.name} astrologer (${Lc.native})` : ""}. ${hookLine(chartOf(p), p, true, true)}\nAsk me anything about career, marriage, money, health, studies or family. I read your Kundli down to the Sukshma dasha and answer with **exact windows**, your **power days** and a **personal plan**.${state.lang === "auto" ? "\nWrite in any Indian language and I will reply in it." : ""}` }];
  const langOpts = `<option value="auto"${state.lang === "auto" ? " selected" : ""}>Auto: reply in the language I type</option>` + [["s", "Official Indian languages"], ["o", "More Indian languages"], ["e", "English"]].map(([g, lab]) => `<optgroup label="${lab}">${LANGS.filter(l => l.group === g).map(l => `<option value="${l.code}"${state.lang === l.code ? " selected" : ""}>${l.native === l.name ? l.name : `${l.native} · ${l.name}`}</option>`).join("")}</optgroup>`).join("");
  return `${exampleBanner(p)}
  <section class="card chatcard">
    <div class="card-head"><h2>Ask the stars <span class="hi" lang="hi">प्रश्न कुंडली</span></h2>
      <label class="sr" for="lang">Answer language</label><select id="lang" class="langsel">${langOpts}</select><span class="pill good">${curPlan().name} plan · ${qPill(p.id)}</span></div>
    ${voicePanel()}
    <div class="chat" id="chat" aria-live="polite">${msgs.map((m, i) => `<div class="msg ${m.role}">${md(m.content)}${m.role === "assistant" && m.content.length > 40 ? `<button class="listen" data-speak="${state.chat.length ? i : -1}" aria-label="Listen to this answer">${Voice.speaking ? "Stop" : "Listen"}</button>` : ""}${m.upsell ? `<div class="row-actions">${trialBtn()}<button class="btn sm${trialUsed() ? "" : " ghost"}" data-goto="plus">See plans</button></div>` : ""}${m.locked ? lockCard() : ""}${m.paywall ? `<div class="lock"><div class="row-actions">${packButtons()}${trialBtn("Or try Silver free for 7 days")}</div><p class="note">After paying you get a code; enter it in the Plus tab.</p></div>` : ""}</div>`).join("")}${state.aiBusy ? "" : ""}</div>
    ${pendingCard()}
    <div class="sugg"${state.pending ? " hidden" : ""}>${SUGGEST.map(s => `<button class="chip btnchip" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>
    <form id="askform" class="ask" novalidate><label class="sr" for="q">Your question</label><input id="q" autocomplete="off" placeholder="Type your question in English, Hindi or Hinglish" maxlength="400"><button class="btn" type="button" data-act="ask" ${state.aiBusy ? "disabled" : ""}>${state.aiBusy ? "Answering…" : "Ask"}</button><button class="btn ghost mic${Voice.listening ? " on" : ""}" type="button" data-act="mic" aria-pressed="${Voice.listening}">${Voice.listening ? "Send" : "Speak"}</button></form>
    <p class="note" id="ask-note" role="status"></p>
    <p class="note">Guidance for reflection, not a substitute for medical, legal or financial advice.</p>
  </section>`;
}
function md(s) {
  const lines = esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split(/\n/);
  let out = "", inList = false;
  for (const l of lines) {
    const m = l.match(/^\s*[-•*]\s+(.*)/);
    if (m) { if (!inList) { out += "<ul>"; inList = true; } out += `<li>${m[1]}</li>`; continue; }
    if (inList) { out += "</ul>"; inList = false; }
    const h = l.match(/^#{1,4}\s+(.*)/);
    if (h) out += `<p><b>${h[1]}</b></p>`; else if (l.trim()) out += `<p>${l}</p>`;
  }
  if (inList) out += "</ul>";
  return out;
}
function scrollChat() { const el = $("#chat"); if (el) el.scrollTop = el.scrollHeight; }

function relatedLords(c, topic) {
  const set = new Set(topic.karaka);
  for (const h of topic.houses) {
    set.add(A.SIGN_LORD[(c.lagna.sign + h - 1) % 12]);
    for (const k of A.PLANETS) if (c.planets[k].house === h) set.add(k);
  }
  return set;
}
/* weight of each planet for a topic: house lord 3, occupant 2, karaka 1 */
function relWeights(c, topic) {
  const w = {};
  const up = (k, v) => { w[k] = Math.max(w[k] || 0, v); };
  topic.karaka.forEach(k => up(k, 1));
  for (const h of topic.houses) {
    up(A.SIGN_LORD[(c.lagna.sign + h - 1) % 12], h === topic.houses[0] ? 3 : 2);
    for (const k of A.PLANETS) if (c.planets[k].house === h) up(k, 2);
  }
  return w;
}
function relatedLords(c, topic) { return new Set(Object.keys(relWeights(c, topic))); }
/* rank Mahadasha–Antardasha–Pratyantardasha windows, then pin the peak Sukshma inside each */
function windows(c, topic, n = 3, years = 8) {
  const w = relWeights(c, topic), r = l => w[l] || 0, J = nowJ(), out = [];
  for (const m of c.dasha) for (const ad of m.ads) {
    if (ad.end < J || ad.start > J + years * A.YEAR) continue;
    for (const pd of A.subPeriods(ad)) {
      if (pd.end < J || pd.start > J + years * A.YEAR) continue;
      const sc = r(m.lord) + 1.5 * r(ad.lord) + 1.5 * r(pd.lord);
      if (sc < 3) continue;
      const sds = A.subPeriods(pd).filter(s => s.end > J);
      let peak = null;
      for (const s of sds) if (r(s.lord) > 0 && (!peak || r(s.lord) > r(peak.lord))) peak = s;
      out.push({ md: m.lord, ad: ad.lord, pd: pd.lord, start: Math.max(pd.start, J), end: pd.end, sc, peak });
    }
  }
  // earliest strong windows first, spaced at least 60 days apart; fill with the best remaining
  const chrono = out.filter(x => x.sc >= 6).sort((x, y) => x.start - y.start), pickd = [];
  for (const x of chrono) { if (pickd.length >= n) break; if (!pickd.length || x.start - pickd[pickd.length - 1].start >= 60) pickd.push(x); }
  for (const x of out.sort((x, y) => y.sc - x.sc)) { if (pickd.length >= n) break; if (!pickd.includes(x) && pickd.every(p => Math.abs(p.start - x.start) >= 60)) pickd.push(x); }
  return pickd.sort((x, y) => x.start - y.start);
}
function soonSukshma(c, topic, days = 90) {
  const w = relWeights(c, topic), J = nowJ(), out = [];
  for (const m of c.dasha) for (const ad of m.ads) {
    if (ad.end < J || ad.start > J + days) continue;
    for (const pd of A.subPeriods(ad)) {
      if (pd.end < J || pd.start > J + days) continue;
      for (const sd of A.subPeriods(pd)) if (sd.end > J && sd.start < J + days && (w[sd.lord] || 0) >= 2) out.push({ chain: `${m.lord}–${ad.lord}–${pd.lord}–${sd.lord}`, start: Math.max(sd.start, J), end: sd.end });
    }
  }
  return out.slice(0, 3);
}
const strengthLabel = sc => sc >= 9 ? "strongest" : sc >= 6 ? "strong" : "supportive";
function housesRuled(c, lord) { const hs = []; for (let h = 1; h <= 12; h++) if (A.SIGN_LORD[(c.lagna.sign + h - 1) % 12] === lord) hs.push(h); return hs; }
function lordRole(c, lord) {
  const hs = housesRuled(c, lord), pl = c.planets[lord];
  return `${lord} (in your ${ord(pl.house)} house${hs.length ? `, rules ${hs.map(ord).join(" and ")}` : ""})`;
}
/* ---------- who is the question about? ---------- */
const RELS = [
  { rel: "Son", words: ["son", "beta", "bete", "betey"], g: "M", he: "he", his: "his" },
  { rel: "Daughter", words: ["daughter", "beti", "bitiya"], g: "F", he: "she", his: "her" },
  { rel: "Wife", words: ["wife", "patni", "biwi", "missus"], g: "F", he: "she", his: "her", spouse: true },
  { rel: "Husband", words: ["husband", "pati", "patidev"], g: "M", he: "he", his: "his", spouse: true },
  { rel: "Partner", words: ["partner", "girlfriend", "boyfriend", "fiance", "fiancee", "fiancé", "fiancée"], g: "", he: "they", his: "their", spouse: true },
  { rel: "Mother", words: ["mother", "mom", "mummy", "mumma", "maa", "mata", "mataji"], g: "F", he: "she", his: "her" },
  { rel: "Father", words: ["father", "dad", "daddy", "papa", "pita", "pitaji"], g: "M", he: "he", his: "his" },
  { rel: "Brother", words: ["brother", "bhai", "bhaiya", "bro"], g: "M", he: "he", his: "his" },
  { rel: "Sister", words: ["sister", "behen", "bahen", "didi", "sis"], g: "F", he: "she", his: "her" },
  { rel: "Friend", words: ["friend", "dost"], g: "", he: "they", his: "their" },
];
const POSS = "(?:my|mere|meri|mera|hamare|hamari|hamara|our)";
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function detectRelation(ql) {
  for (const r of RELS) for (const w of r.words) {
    const W = escRe(w);
    // "my son", "my elder son", "my 17 year old son", "mere bete", "bete ki", "son's", "beti ko"
    const pats = [
      new RegExp(`\\b${POSS}\\s+(?:[\\w-]+\\s+){0,4}?${W}(?:'s|s)?\\b`, "i"),
      new RegExp(`\\b${W}\\s+(?:ki|ka|ke|ko|kaa|se|ne)\\b`, "i"),
    ];
    if (w.length > 3 && !r.spouse) pats.push(new RegExp(`\\b${W}'s\\b`, "i"));
    let m = null;
    for (const re of pats) { m = ql.match(re); if (m) break; }
    if (m) {
      // questions about one's own future spouse are read from the asker's own 7th house
      if (r.spouse && /\b(future|will i (get|find|meet|marry)|when will i|kab milegi|kab milega|kaisi hogi|kaisa hoga|what will my|how will my|kaun hogi|kaun hoga|meet my)\b/.test(ql)) return null;
      return { ...r, match: m[0] };
    }
  }
  return null;
}
function resolveSubject(q) {
  const ql = q.toLowerCase(), me = prof();
  for (const p of profiles()) {
    if (p === me || !p.name || p.name.length < 3) continue;
    if (new RegExp(`\\b${escRe(p.name.toLowerCase())}\\b`).test(ql)) return { profile: p, rel: RELS.find(r => r.rel === p.relation) };
  }
  const r = detectRelation(ql);
  if (!r) {
    if (state.lastSubject && /\b(he|she|him|her|his|they|them|their|uska|uski|uske|unka|unki|unke|woh|wo)\b/.test(ql)) {
      const p = profiles().find(x => x.id === state.lastSubject);
      if (p && p !== me) return { profile: p, rel: RELS.find(x => x.rel === p.relation) };
    }
    return { self: true };
  }
  const rl = r.rel.toLowerCase();
  const matches = profiles().filter(p => p !== me && !p.example && ((p.relation || "").toLowerCase() === rl || (r.spouse && ["wife", "husband", "partner"].includes((p.relation || "").toLowerCase()))));
  if (matches.length === 1) return { profile: matches[0], rel: r };
  if (matches.length > 1) return { choose: matches, rel: r };
  return { need: r };
}
function whoWords(p, self, rel) {
  if (self) return { Your: "Your", your: "your", you: "you", You: "You", name: "you", header: "" };
  const n = p.name;
  return { Your: `${n}'s`, your: `${n}'s`, you: n, You: n, name: n, header: `**Reading from ${n}'s chart${rel ? ` (your ${rel.rel.toLowerCase()})` : ""}**\n` };
}

/* ---------- question type ---------- */
function isYesNo(q) {
  const ql = q.trim().toLowerCase();
  if (/\b(when|kab|kitne|how long|which year|which month|what time)\b/.test(ql)) return false;
  return ql.split(/[,.;!?]+/).some(cl => /^(will|shall|can|could|would|should|is|are|am|do|does|did|has|have|may|kya)\b/.test(cl.trim())) || /\b(or not|ya nahi|ya nahin|ya nhi|hoga\??$|milega\??$|milegi\??$|possible\??$)/.test(ql);
}
const _twCache = new Map();
function topicHit(t, ql) {
  return t.words.some(w => {
    w = w.trim();
    if (!_twCache.has(w)) _twCache.set(w, new RegExp(w.length <= 3 ? `\\b${escRe(w)}\\b` : `\\b${escRe(w)}`, "i"));
    return _twCache.get(w).test(ql);
  });
}
function topicOf(q, strip) {
  let ql = q.toLowerCase();
  if (strip) ql = ql.replace(strip.toLowerCase(), " ");
  return TOPICS.find(t => topicHit(t, ql));
}
const GENERAL = { key: "general", label: "this matter", words: [], houses: [1, 11], karaka: ["Jupiter"] };
const EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const TIPS = {
  admission: "Apply to a balanced list of dream, target and safe colleges, and put extra hours into mock tests and the application essay.",
  career: "Update your CV, reach out to three people in your field this week, and prepare for interviews with real examples.",
  marriage: "Be open to introductions through family and friends, and talk honestly about expectations early.",
  money: "Avoid speculation, build an emergency fund first, and review investments with a qualified adviser.",
  health: "Follow a regular routine of sleep, walking and simple food, and consult a doctor for any symptoms.",
  education: "Follow a fixed daily study timetable and revise with past papers every week.",
  children: "Focus on overall health and routine, and follow your doctor's guidance.",
  travel: "Keep documents ready, apply early, and have a backup plan for visas.",
  property: "Check legal papers carefully and do not stretch your budget.",
  general: "Act with steady effort and patience, and keep your plans flexible.",
};
function verdict(c, topic, q, W) {
  const J = nowJ(), cur = A.currentDasha(c, J), tr = A.transits(J), R = [];
  let s = 0;
  const H = topic.houses[0], sign = (c.lagna.sign + H - 1) % 12, lord = A.SIGN_LORD[sign], lp = c.planets[lord];
  if ([1, 4, 5, 7, 9, 10].includes(lp.house)) { s += 2; R.push(`The ${ord(H)} house lord ${lord} is well placed in ${W.your} ${ord(lp.house)} house, a clear promise for this matter.`); }
  else if ([6, 8, 12].includes(lp.house)) { s -= 1.5; R.push(`The ${ord(H)} house lord ${lord} sits in the ${ord(lp.house)} house, which points to delays or extra competition.`); }
  else { s += 0.5; R.push(`The ${ord(H)} house lord ${lord} is moderately placed in the ${ord(lp.house)} house, so effort decides the result.`); }
  if (EXALT[lord] === lp.sign) { s += 2; R.push(`${lord} is exalted in ${A.SIGNS[lp.sign]}, which strengthens the promise.`); }
  else if (EXALT[lord] !== undefined && (EXALT[lord] + 6) % 12 === lp.sign) { s -= 2; R.push(`${lord} is debilitated in ${A.SIGNS[lp.sign]}, so success needs persistence.`); }
  else if (A.SIGN_LORD[lp.sign] === lord) { s += 1.5; R.push(`${lord} is in its own sign, which gives stability.`); }
  const ben = ["Jupiter", "Venus", "Mercury", "Moon"].filter(k => c.planets[k].house === H && k !== lord);
  const mal = ["Saturn", "Mars", "Rahu", "Ketu"].filter(k => c.planets[k].house === H && k !== lord);
  if (ben.length) { s += ben.length; R.push(`${ben.join(" and ")} in the ${ord(H)} house ${ben.length > 1 ? "add" : "adds"} support.`); }
  if (mal.length) { s -= 0.5 * mal.length; R.push(`${mal.join(" and ")} in the ${ord(H)} house ${mal.length > 1 ? "bring" : "brings"} some obstacles before success.`); }
  const jh = c.planets.Jupiter.house, asp = [0, 4, 6, 8].map(k => ((jh - 1 + k) % 12) + 1);
  if (asp.includes(H) && lord !== "Jupiter" && !ben.includes("Jupiter")) { s += 1.5; R.push(`Jupiter's aspect on the ${ord(H)} house protects this area.`); }
  const wt = relWeights(c, topic);
  const lv = [["md", 1, "Mahadasha"], ["ad", 1.5, "Antardasha"], ["pd", 1, "Pratyantar"]].filter(([k]) => wt[cur[k].lord]);
  if (lv.length) { s += lv.reduce((a, [, w]) => a + w, 0); R.push(`The running ${lv.map(([k, , n]) => `${cur[k].lord} ${n}`).join(" and ")} ${lv.length > 1 ? "are" : "is"} linked to this matter, so the current period supports it.`); }
  else { s -= 1; R.push(`The running ${cur.md.lord}–${cur.ad.lord}–${cur.pd.lord} period is not directly linked, so it needs more effort right now.`); }
  const tj = ((tr.Jupiter.sign - c.moonSign + 12) % 12) + 1;
  if ([2, 5, 7, 9, 11].includes(tj)) { s += 1; R.push(`Jupiter's current transit, ${ord(tj)} from the Moon, is favourable.`); }
  const ql = q.toLowerCase(), cy = new Date().getFullYear();
  let y = null, by = false;
  const ym = ql.match(/\b(by|before|till|until|within)?\s*(20\d\d)\b(\s*(tak|se pehle))?/);
  if (ym) { y = +ym[2]; by = !!(ym[1] || ym[3]); }
  else if (/\b(this year|is saal|iss saal)\b/.test(ql)) y = cy;
  else if (/\b(next year|agle saal)\b/.test(ql)) y = cy + 1;
  if (y && y >= cy) {
    const y0 = by ? J : Math.max(J, A.jd(y, 1, 1, 0)), y1 = A.jd(y + 1, 1, 1, 0);
    const span = by ? `between now and the end of ${y}` : `within ${y}`;
    const hit = windows(c, topic, 12, y - cy + 1.2).find(w => w.sc >= 6 && w.end > y0 && w.start < y1);
    if (hit) { s += 1.5; R.unshift(`A strongly linked period (${hit.md}–${hit.ad}–${hit.pd}) falls ${span}.`); } else { s -= 1; R.unshift(`No strongly linked dasha period falls ${span}.`); }
  }
  const label = s >= 5 ? "Yes, strongly indicated" : s >= 2.5 ? "Yes, likely" : s >= 0 ? "Possible, with focused effort" : "Difficult at present";
  return { label, score: Math.round(Math.max(15, Math.min(92, 50 + s * 6))), reasons: R, lord };
}

/* ---------- offline answers ---------- */
function edgeFor(c, topic, self) {
  const ys = yogas(c), y = ys.find(x => x.topics.includes(topic.key)) || ys[0], pp = powerPlanet(c);
  const you = self ? "your" : "the";
  return `${y ? `**${y.name}**: ${y.text[0].toUpperCase() + y.text.slice(1)} ` : ""}${pp.text.replace("in your", `in ${you}`)}. Lean on this strength.`;
}
function offlineAnswer(q, c, p, sub = {}, lock = false) {
  const self = !sub.profile, W = whoWords(p, self, sub.rel);
  const topic = topicOf(q, sub.rel && sub.rel.match);
  const J = nowJ(), cur = A.currentDasha(c, J), tr = A.transits(J);
  if (isYesNo(q)) {
    const t = topic || GENERAL, v = verdict(c, t, q, W), ed = edgeFor(c, t, self);
    if (lock) return `${W.header}${hookLine(c, p, self)}\n\n**Answer: ${v.label}** (about ${v.score}% favourable)\n\n**Why**\n${v.reasons.slice(0, 4).map(r => "- " + r).join("\n")}`;
    return `${W.header}${hookLine(c, p, self)}\n\n**Answer: ${v.label}** (about ${v.score}% favourable)\n\n**Why**\n${v.reasons.slice(0, 4).map(r => "- " + r).join("\n")}\n\n**${self ? "Your" : W.Your} edge**\n${ed}\n\n**${self ? "Your" : "The"} 3-step plan**\n1. ${TIPS[t.key] || TIPS.general}\n2. Take the important step on a **${LORD_DAY[v.lord]}**, the day of ${v.lord}, who rules this matter.\n3. ${personalRemedy(v.lord)}${p.unknownTime ? `\n\n${W.Your} birth time is unknown, so the house-based reasons are approximate.` : ""}`;
  }
  if (!topic) {
    const md = cur.md.lord, mdH = c.planets[md].house, L = x => c.planets[x.lord].house;
    const role = l => lordRole(c, l).replace("in your", `in ${W.your}`);
    return `${W.header}**${self ? "Your" : W.Your} running period: ${cur.md.lord}–${cur.ad.lord}–${cur.pd.lord}–${cur.sd.lord}**
- **Mahadasha ${role(cur.md.lord)}** until **${fmtJ(cur.md.end)}**. The long theme is ${HOUSE_THEME[mdH]}.
- **Antardasha ${role(cur.ad.lord)}** until **${fmtJ(cur.ad.end)}**. This year's focus is ${HOUSE_THEME[L(cur.ad)]}.
${lock ? "" : `- **Pratyantardasha ${role(cur.pd.lord)}** until **${fmtJ(cur.pd.end)}**. These weeks bring ${HOUSE_THEME[L(cur.pd)]}.
- **Sukshma ${role(cur.sd.lord)}** until **${fmtJ(cur.sd.end)}**. These days favour ${HOUSE_THEME[L(cur.sd)]}.
Next Pratyantardasha: ${(() => { const ps = A.subPeriods(cur.ad); const i = ps.indexOf(cur.pd); const nx = ps[i + 1]; return nx ? `${cur.md.lord}–${cur.ad.lord}–${nx.lord} from ${fmtJ(nx.start)}` : `a new Antardasha from ${fmtJ(cur.ad.end)}`; })()}.
`}
Remedy: ${REMEDY[md]}
Ask about career, marriage, money, health, studies, travel or property for exact date windows.`;
  }
  const H = topic.houses[0], sign = (c.lagna.sign + H - 1) % 12, lord = A.SIGN_LORD[sign], lp = c.planets[lord];
  const occ = A.PLANETS.filter(k => c.planets[k].house === H);
  const strength = [1, 4, 5, 7, 9, 10].includes(lp.house) ? "well placed, which gives strong support" : [6, 8, 12].includes(lp.house) ? "in a challenging house, so results come through persistence" : "moderately placed, so steady effort brings results";
  const wins = windows(c, topic);
  const wt = relWeights(c, topic);
  const links = ["md", "ad", "pd", "sd"].filter(k => wt[cur[k].lord]);
  const active = links.length >= 2 || wt[cur.ad.lord] >= 2 || wt[cur.pd.lord] >= 2;
  const tj = ((tr.Jupiter.sign - c.moonSign + 12) % 12) + 1;
  const first = wins[0];
  let s = `${W.header}${hookLine(c, p, !sub.profile)}\n\n**The short answer**\n${first && lock ? `${self ? "Your" : W.Your} chart shows a clear window for ${topic.label}, led by the ${first.md}–${first.ad} period. The exact start and end dates are ready below.` : first ? `${self ? "Your" : W.Your} strongest window for ${topic.label} opens on **${fmtJ(first.start)}** (${first.md}–${first.ad}–${first.pd}) and runs to **${fmtJ(first.end)}**.` : `No single standout window in the next 8 years; steady effort and good transits decide it.`}\n\n**Reading for ${topic.label}**\n${W.Your} ${ord(H)} house (${A.SIGNS[sign]}) governs this area. Its lord **${lord}** sits in ${W.your} ${ord(lp.house)} house in ${A.SIGNS[lp.sign]}${lp.retro && lord !== "Rahu" && lord !== "Ketu" ? " (retrograde)" : ""}, ${strength}.`;
  if (occ.length) s += ` ${occ.join(" and ")} ${occ.length > 1 ? "occupy" : "occupies"} this house, adding ${occ.length > 1 ? "their" : "its"} colour to it.`;
  const LV = { md: "Mahadasha", ad: "Antardasha", pd: "Pratyantar", sd: "Sukshma" };
  s += `\n\n**Right now: ${cur.md.lord}–${cur.ad.lord}–${cur.pd.lord}–${cur.sd.lord}**\n${lock ? "" : `Pratyantar runs until **${fmtJ(cur.pd.end)}** and Sukshma until **${fmtJ(cur.sd.end)}**. `}${links.length ? `Linked to this question: ${links.map(k => `${LV[k]} ${cur[k].lord}`).join(", ")}. ` : ""}${active ? "The current period is directly connected, so movement is likely soon." : "The current period is only weakly linked, so treat it as preparation."}`;
  s += ` Jupiter is transiting ${W.your} ${ord(tj)} from Moon${[2, 5, 7, 9, 11].includes(tj) ? ", which adds support." : ", so blessings need extra effort."}`;
  if (lock) { s += `\n\n**${self ? "Your" : W.Your} edge**\n${edgeFor(c, topic, self)}`; return s; }
  if (wins.length) s += `\n\n**Most likely windows** (Mahadasha–Antardasha–Pratyantar)\n` + wins.map(w => `- **${fmtJ(w.start)} – ${fmtJ(w.end)}**: ${w.md}–${w.ad}–${w.pd}, ${strengthLabel(w.sc)}${w.peak ? `. Peak days: **${fmtJ(Math.max(w.peak.start, nowJ()))} – ${fmtJ(w.peak.end)}** (${w.peak.lord} Sukshma)` : ""}`).join("\n");
  else s += `\n\nNo strongly linked period appears in the next 8 years, so results depend on effort and transits.`;
  const soon = soonSukshma(c, topic);
  if (soon.length) s += `\n\n**Good days in the next 90 days**\n` + soon.map(x => `- ${fmtJ(x.start)} – ${fmtJ(x.end)} (${x.chain})`).join("\n");
  if (p.unknownTime) s += `\n\n${W.Your} birth time is unknown, so Pratyantar and Sukshma dates may shift by weeks. Add the exact time for precise dates.`;
  const pdays = powerDays(c, [lord, ...Object.keys(wt)]);
  s += `\n\n**${self ? "Your" : W.Your} edge**\n${edgeFor(c, topic, self)}`;
  if (pdays.length) s += `\n\n**Power days this month**\n${pdays.map(d => `- **${d.label}** (${d.tara} Tara${LORD_DAY[lord] && d.label.startsWith(LORD_DAY[lord].slice(0, 3)) ? `, ${lord}'s day` : ""})`).join("\n")}`;
  s += `\n\n**${self ? "Your" : "The"} 3-step plan**\n1. ${TIPS[topic.key] || TIPS.general}\n2. Make your key move on a power day${pdays[0] ? `, ideally **${pdays[0].label}**` : ""}.\n3. ${personalRemedy(lord)}`;
  return s;
}
function chartSummary(p, c) {
  const J = nowJ(), cur = A.currentDasha(c, J), tr = A.transits(J), tz = deviceTz();
  const L = [];
  L.push(`Name: ${p.name}; gender: ${p.gender === "F" ? "female" : p.gender === "M" ? "male" : "not given"}${p.relation && p.relation !== "Self" ? `; relation to the user: ${p.relation.toLowerCase()}` : ""}`);
  L.push(`Born: ${fmtDateStr(p.date)} ${p.unknownTime ? "(birth time unknown, noon used; Lagna uncertain)" : fmtTime(p.time)} at ${p.place || ""} (lat ${p.lat}, lon ${p.lon}, UTC${p.tz >= 0 ? "+" : ""}${p.tz})`);
  L.push(`Lagna: ${A.SIGNS[c.lagna.sign]} ${c.lagna.deg}, ${c.lagna.nak.name}`);
  for (const k of A.PLANETS) { const x = c.planets[k]; L.push(`${k}: ${A.SIGNS[x.sign]} ${x.deg}, house ${x.house}, ${x.nak.name} pada ${x.nak.pada}${x.retro && k !== "Rahu" && k !== "Ketu" ? ", retrograde" : ""}`); }
  L.push(`Moon sign ${A.SIGNS[c.moonSign]}, birth nakshatra ${c.nak.name}`);
  L.push(`Manglik: ${c.doshas.manglik.lagna || c.doshas.manglik.moon ? "yes" : "no"}; Kaal Sarp: ${c.doshas.kaalSarp ? "yes" : "no"}`);
  L.push(`Current Vimshottari (4 levels): Mahadasha ${cur.md.lord} ${fmtJ(cur.md.start)} to ${fmtJ(cur.md.end)}; Antardasha ${cur.ad.lord} ${fmtJ(cur.ad.start)} to ${fmtJ(cur.ad.end)}; Pratyantardasha ${cur.pd.lord} ${fmtJ(cur.pd.start)} to ${fmtJ(cur.pd.end)}; Sukshma ${cur.sd.lord} ${fmtJ(cur.sd.start)} to ${fmtJ(cur.sd.end)}`);
  L.push(`Houses ruled: ` + ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map(k => `${k} ${housesRuled(c, k).join("&")}`).join("; "));
  const up = []; let found = false;
  for (const m of c.dasha) for (const a of m.ads) { if (a === cur.ad) found = true; else if (found && up.length < 10) up.push(`${m.lord}-${a.lord} ${fmtJ(a.start)} to ${fmtJ(a.end)}`); }
  L.push(`Upcoming Antardashas: ${up.join("; ")}`);
  const pds = [];
  for (const m of c.dasha) for (const ad of m.ads) { if (ad.end < J || ad.start > J + 2 * A.YEAR) continue; for (const pd of A.subPeriods(ad)) if (pd.end > J && pd.start < J + 2 * A.YEAR) pds.push(`${m.lord}-${ad.lord}-${pd.lord} ${fmtJ(pd.start)} to ${fmtJ(pd.end)}`); }
  L.push(`Pratyantardashas, next 24 months: ${pds.join("; ")}`);
  const sds = [];
  for (const pd of [cur.pd].concat(A.subPeriods(cur.ad).filter(x => x.start >= cur.pd.end && x.start < J + 75))) for (const sd of A.subPeriods(pd)) if (sd.end > J && sd.start < J + 75) sds.push(`${pd.lord}-${sd.lord} ${fmtJ(sd.start)} to ${fmtJ(sd.end)}`);
  L.push(`Sukshma dashas, next 75 days (Pratyantar-Sukshma): ${sds.join("; ")}`);
  L.push(`Today ${fmtJ(J)} transits (sidereal): ` + ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"].map(k => `${k} ${A.SIGNS[tr[k].sign]}${tr[k].retro && k !== "Rahu" ? " R" : ""} (house ${((tr[k].sign - c.lagna.sign + 12) % 12) + 1} from Lagna, ${((tr[k].sign - c.moonSign + 12) % 12) + 1} from Moon)`).join("; "));
  L.push(`Saturn status: ${saturnStatus(c, tr).tag}`);
  return L.join("\n");
}
function engineWindows(q, c, sub = {}) {
  const topic = topicOf(q, sub.rel && sub.rel.match);
  if (isYesNo(q)) {
    const t = topic || GENERAL, v = verdict(c, t, q, whoWords(sub.profile || prof(), !sub.profile, sub.rel));
    return `\n\nENGINE VERDICT for "${t.label}": ${v.label} (${v.score}% favourable). Reasons: ${v.reasons.join(" ")}`;
  }
  if (!topic) return "";
  const ws = windows(c, topic), soon = soonSukshma(c, topic);
  return `\n\nENGINE WINDOWS for "${topic.label}" (houses ${topic.houses.join(", ")}; linked lords: ${Object.entries(relWeights(c, topic)).map(([k, v]) => `${k}(${v === 3 ? "house lord" : v === 2 ? "house lord/occupant" : "karaka"})`).join(", ")}):\n` +
    ws.map(w => `- ${w.md}-${w.ad}-${w.pd} ${fmtJ(w.start)} to ${fmtJ(w.end)}, ${strengthLabel(w.sc)}${w.peak ? `; peak Sukshma ${w.peak.lord} ${fmtJ(Math.max(w.peak.start, nowJ()))} to ${fmtJ(w.peak.end)}` : ""}`).join("\n") +
    (soon.length ? `\nNear-term good Sukshma: ${soon.map(x => `${x.chain} ${fmtJ(x.start)} to ${fmtJ(x.end)}`).join("; ")}` : "");
}
async function ask(q) {
  q = q.trim(); if (!q) return;
  if (state.aiBusy) { const n = $("#ask-note"); if (n) n.textContent = "Finishing the previous answer. Your next question can go in a moment."; return; }
  state.chat.push({ role: "user", content: q });
  state.pending = null;
  const sub = resolveSubject(q);
  if (sub.need) {
    const r = sub.need;
    state.pending = { q, rel: r };
    state.chat.push({ role: "assistant", content: `This question is about your ${r.rel.toLowerCase()}. ${r.rel === "Partner" || r.rel === "Friend" ? "Their" : r.his[0].toUpperCase() + r.his.slice(1)} own birth chart decides this, not yours, so I need **your ${r.rel.toLowerCase()}'s birth details**: name, date of birth, time of birth and place of birth.\nFill them in below and I will answer from ${r.his} chart only.` });
    render(); setTimeout(() => { const el = $("#o-name"); if (el) el.focus(); }, 30); return;
  }
  if (sub.choose) {
    state.pending = { q, rel: sub.rel, choose: sub.choose };
    state.chat.push({ role: "assistant", content: `You have more than one ${sub.rel.rel.toLowerCase()} saved. Which one is this question about?` });
    render(); return;
  }
  const subj = sub.profile || prof();
  if (qLeft(subj.id) <= 0) {
    const free = planState().id === "free";
    state.chat.push({ role: "assistant", content: free
      ? `You have used your **${PLANS.free.questions} free questions**. Keep going for just **₹${QPACKS[0].price} for ${QPACKS[0].q} questions** (about ₹${Math.round(QPACKS[0].price / QPACKS[0].q)} a question) or **₹${QPACKS[1].price} for ${QPACKS[1].q}**. Credits never expire and work for every kundli.`
      : `You have used this month's **${curPlan().questions} questions for ${subj.name}**. Add a question pack, or move to **Gold** for unlimited questions.`, paywall: true });
    render(); return;
  }
  return answerFor(q, sub);
}
function langFor(q) {
  const chosen = state.lang === "auto" ? "en" : state.lang;
  const det = detectLang(q, chosen);
  if (state.lang === "auto") return LANG[det] || LANG.en;
  return LANG[det !== chosen && det !== "en" ? det : chosen] || LANG.en;
}
async function answerFor(q, sub) {
  const p = sub.profile || prof(), c = chartOf(p), L = langFor(q);
  state.lastSubject = sub.profile ? sub.profile.id : null;
  consumeQ(p.id);
  const lock = isLocked(p);
  if (!state.sample) {
    const note = !["en", "hinglish"].includes(L.code) ? `*${L.hello}! Full answers in ${L.name} (${L.native}) come from the AI astrologer. It is not connected on this screen, so here is your reading in English.*\n\n` : "";
    state.chat.push({ role: "assistant", content: note + offlineAnswer(q, c, p, sub, lock), locked: lock });
    markFreeFull(p);
    render(); return;
  }
  const msg = { role: "assistant", content: "Reading the chart…", locked: lock };
  state.chat.push(msg); state.aiBusy = true; render();
  const yn = isYesNo(q), other = !!sub.profile;
  const sys = `You are Spatik, a warm, precise Vedic astrologer inside an astrology app. Use ONLY the computed chart data below (sidereal, Lahiri, whole-sign houses, Vimshottari dasha). Never invent planet positions.
${other ? `This question is about ${p.name}, the user's ${(p.relation || "relative").toLowerCase()}. The chart below is ${p.name}'s own chart. Talk about ${p.name} by name and use only this chart; do not mix in the user's own chart.\n` : ""}If the user asks about another person whose chart is not given below, do not answer from this chart. Ask for that person's name, date of birth, time of birth and place of birth instead.
LANGUAGE: ${agentLine(L, state.lang === "auto")}
STYLE (this is what makes Spatik Astro special): Write like a wise, warm family astrologer who knows ${other ? p.name : "this person"} deeply. Every answer must feel written for this one chart, never generic. Use this structure:
1. One-line personal hook using the name and one striking item from SIGNATURE (birth-star deity or gift, a yoga, or the power planet).
2. The direct answer in one or two sentences.
3. Why: 2-3 reasons naming the houses, lords and running dasha.
4. ${yn ? "The verdict strength (no date lists)." : "Timing with exact dates."}
5. "Your edge": the chart strength they should lean on (a yoga or the power planet).
6. A 3-step plan: one practical step, one step on a POWER DAY${yn ? " or the ruling planet's weekday" : ""}, and one remedy with its mantra, weekday and colour from the data.
Be aspirational and specific: show what is possible and how to get there. No filler such as "the stars suggest" or "everything happens for a reason". Every claim must come from the data below.
${state.voiceTurn ? (() => { const tn = toneFor(chartOf(prof())); return `VOICE: The user spoke this question and will HEAR your reply read aloud. Open with 2-3 short spoken sentences that answer directly, in a ${tn.label.toLowerCase()} tone, like ${tn.role}. Avoid tables and symbols; write numbers and dates the way people say them.\n`; })() : ""}Rules:
${yn ? `This is a YES/NO question. Open with one bold verdict line (Yes / Likely / Possible with effort / Unlikely right now) that agrees with the ENGINE VERDICT, then give 3 short reasons from houses, lords, the running dasha and transits, then 1 practical step and 1 remedy. Do NOT list date windows, dasha date ranges or peak days unless the question itself names a time frame.` : `Time every prediction with all four Vimshottari levels: Mahadasha sets the theme, Antardasha the year, Pratyantardasha the main window (give exact start and end dates), and Sukshma the peak days inside it. Explain in one line why those lords connect to the question. Copy dates exactly from the data below and never calculate new ones; if the ENGINE WINDOWS section is present, base your windows on it.${p.unknownTime ? " The birth time is unknown, so say that Pratyantar and Sukshma dates are approximate." : ""}`}
${lock ? 'FREE PLAN: give the hook, the direct answer, the reasons and "your edge", but do NOT give any exact dates, date windows, peak days or power days (the app shows an unlock card for those). ' : ""}Say "most likely" rather than promising an outcome. Keep it under ${yn ? 230 : 320} words, use short paragraphs and at most one short bullet list, and use **bold** for the key point. Be encouraging and practical, never fear-inducing; no guarantees about death, illness or exact events. For health, legal or money decisions add one line suggesting a qualified professional.

CHART DATA
${chartSummary(p, c)}
SIGNATURE: ${signatureText(c, p)}
POWER DAYS (next 30 days, good Tara from the birth star): ${powerDays(c, [p && c ? A.SIGN_LORD[(c.lagna.sign + ((topicOf(q, sub.rel && sub.rel.match) || GENERAL).houses[0]) - 1) % 12] : "Jupiter"]).map(d => `${d.label} (${d.tara})`).join("; ")}
REMEDY DATA: ${Object.keys(LORD_MANTRA).map(k => `${k}: ${LORD_MANTRA[k]}, ${LORD_DAY[k]}, ${LORD_COLOUR[k]}`).join("; ")}${engineWindows(q, c, sub)}`;
  const hist = state.chat.slice(0, -1).filter(m => m.content && !m.content.startsWith("Reading the chart")).slice(-6);
  const input = [{ role: "user", content: sys + "\n\nThe conversation follows. Answer the last user message." }, { role: "assistant", content: "Understood. I will answer from this chart." }].concat(hist.map(m => ({ role: m.role, content: m.content })));
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), state.aiTimeout || 45000);
  try {
    const r = await Promise.race([new Promise((_, rej) => ctrl.signal.addEventListener("abort", () => rej({ code: "timeout" }))), state.sample(input, { cache: false, signal: ctrl.signal, onText: ({ text }) => { msg.content = text || "Reading the chart…"; const el = $("#chat"); if (el && el.lastElementChild) { el.lastElementChild.innerHTML = md(msg.content); scrollChat(); } } })]);
    msg.content = (other ? `**Reading from ${p.name}'s chart**\n` : "") + (r.text || msg.content);
  } catch (e) {
    if (e && e.code === "not_granted") state.sample = null;
    msg.content = offlineAnswer(q, c, p, sub, lock);
  } finally {
    markFreeFull(p);
    clearTimeout(timer);
    state.aiBusy = false; render();
  }
}
function pendingCard() {
  const pd = state.pending; if (!pd) return "";
  if (pd.choose) return `<div class="pend"><div class="sugg">${pd.choose.map(p => `<button class="chip btnchip" data-subj="${p.id}">${esc(p.name)}</button>`).join("")}<button class="chip btnchip" data-act="pending-new">Someone else</button></div></div>`;
  const r = pd.rel, rl = r.rel.toLowerCase();
  return `<div class="pend" id="pendform">
    <h3>Your ${rl}'s birth details</h3>
    <label for="o-name">Name</label><input id="o-name" placeholder="Your ${rl}'s name">
    <div class="two"><div><label for="o-date">Date of birth</label><input type="date" id="o-date" max="${todayStr()}"></div>
    <div>${timeFields("o", "", "Time of birth")}</div></div>
    <label class="check"><input type="checkbox" id="o-unknown"> Birth time not known</label>
    ${placeFields("o", { country: "India" })}
    <p class="err" id="o-err" role="alert"></p>
    <div class="row-actions"><button class="btn" type="button" data-act="pending-save">Save and answer</button><button class="btn ghost" type="button" data-act="pending-cancel">Cancel</button></div>
    <p class="note">Saved on this device as a family profile, so you will not need to enter it again.</p>
  </div>`;
}
function savePending() {
  const pd = state.pending, r = pd.rel, v = id => ($("#" + id).value || "").trim();
  const err = t => { $("#o-err").textContent = t; };
  if (!v("o-name") || !v("o-date")) return err("Please enter the name and date of birth.");
  if (!v("o-city")) return err("Please enter the city or town of birth.");
  if (!v("o-lat")) placeChanged("o", "city");
  const unknown = $("#o-unknown").checked, t = readTime("o");
  const p = { id: Date.now().toString(36), name: v("o-name"), gender: r.g, relation: r.rel, date: v("o-date"), time: unknown || !t ? "12:00" : t, unknownTime: unknown || !t, ...readPlace("o") };
  if (isNaN(p.lat) || isNaN(p.lon) || isNaN(p.tz)) return err("Please choose a country and state for the birth place.");
  if (kundliCount() >= kundliLimit()) return err(limitMsgKundli() + " Open the Plus tab to upgrade.");
  if (!state.profiles.length) state.profiles.push({ ...EXAMPLE });
  state.profiles.push(p); store.set("profiles", state.profiles); store.set("active", state.active);
  const q = pd.q; state.pending = null;
  state.chat.push({ role: "user", content: `${p.name}, born ${fmtDateStr(p.date)}${p.unknownTime ? "" : ", " + fmtTime(p.time)}, ${p.place}` });
  answerFor(q, { profile: p, rel: r });
}

/* ---------- Match ---------- */
function personFields(pre, who) {
  const opts = state.profiles.map((x, i) => `<option value="${i}">${esc(x.name)}</option>`).join("");
  return `<fieldset class="person"><legend>${who === "b" ? "Groom" : "Bride"}</legend>
    ${hasReal() ? `<label for="${who}-pick">Fill from saved</label><select id="${who}-pick" data-pick="${who}"><option value="">Choose a profile</option>${opts}</select>` : ""}
    <label for="${who}-name">Name</label><input id="${who}-name" value="${esc(pre.name)}">
    <div class="two"><div><label for="${who}-date">Date of birth</label><input type="date" id="${who}-date" value="${pre.date}"></div>
    <div>${timeFields(who, pre.time, "Time of birth")}</div></div>
    ${placeFields(who, pre)}
  </fieldset>`;
}
function readPerson(who) {
  return { name: $(`#${who}-name`).value || (who === "b" ? "Groom" : "Bride"), date: $(`#${who}-date`).value, time: readTime(who) || "12:00", ...readPlace(who) };
}
function computeMatch(b, g) {
  const cb = A.chart(b), cg = A.chart(g);
  const r = A.gunaMilan({ moonLon: cb.planets.Moon.lon }, { moonLon: cg.planets.Moon.lon });
  return { b, g, cb, cg, r };
}
function viewMatch() {
  if (!state.match) {
    const real = state.profiles, me = hasReal() ? prof() : null;
    const blank = { name: "", date: "", time: "", country: "India" };
    const other = me ? real.find(x => x !== me && x.gender && x.gender !== me.gender && ["F", "M"].includes(x.gender)) : null;
    if (me && other && ["F", "M"].includes(me.gender)) state.match = computeMatch(me.gender === "M" ? me : other, me.gender === "M" ? other : me);
    else {
      const b = me && me.gender !== "F" ? me : blank, g = me && me.gender === "F" ? me : blank;
      return `<div class="grid">
  <section class="card">
    <h2>Kundli matching <span class="hi" lang="hi">गुण मिलान</span></h2>
    <form id="matchform" novalidate>${personFields(b, "b")}${personFields(g, "g")}<button class="btn" type="button" data-act="match">Match kundlis</button></form>
  </section>
  <section class="card matchwait">
    <div class="score-ring" style="--v:0"><div><span class="big num">?</span><span class="small">of 36 gunas</span></div></div>
    <h3>Your guna score appears here</h3>
    <p class="muted">Enter the birth details of both people and tap <b>Match kundlis</b>. You get all 8 kootas, Mangal dosha, Nadi and Bhakoot checks, free.</p>
  </section></div>`;
    }
  }
  const { b, g, cb, cg, r } = state.match;
  const v = r.total, lvl = v >= 25 ? "good" : v >= 18 ? "warn" : "bad";
  const verdict = v >= 32 ? "Excellent match" : v >= 25 ? "Very good match" : v >= 18 ? "Acceptable match" : "Not recommended without remedies";
  const mb = cb.doshas.manglik.lagna || cb.doshas.manglik.moon, mg = cg.doshas.manglik.lagna || cg.doshas.manglik.moon;
  const mtext = mb === mg ? (mb ? "Both are Manglik, so the dosha cancels out." : "Neither is Manglik.") : `${mb ? esc(b.name) : esc(g.name)} is Manglik and the other is not. Consult a priest about remedies before deciding.`;
  return `<div class="grid">
  <section class="card">
    <h2>Kundli matching <span class="hi" lang="hi">गुण मिलान</span></h2>
    <form id="matchform" novalidate>${personFields(b, "b")}${personFields(g, "g")}<button class="btn" type="button" data-act="match">Match kundlis</button></form>
  </section>
  <section class="card">
    <div class="match-top">
      <div class="score-ring ${lvl}" style="--v:${Math.round(v / 36 * 100)}"><div><span class="big num">${v}</span><span class="small">of 36 gunas</span></div></div>
      <div><h3>${verdict}</h3><p class="muted">${esc(b.name)}: ${A.SIGNS[cb.moonSign]} Moon, ${cb.nak.name}<br>${esc(g.name)}: ${A.SIGNS[cg.moonSign]} Moon, ${cg.nak.name}</p></div>
    </div>
    <div class="tablewrap"><table class="ptable koota"><thead><tr><th>Koota</th><th>Meaning</th><th>Score</th></tr></thead>
    <tbody>${r.kootas.map(k => `<tr><td><b>${k.name}</b></td><td>${k.about}</td><td class="num"><span class="pill ${k.score >= k.max * 0.6 ? "good" : k.score > 0 ? "warn" : "bad"}">${k.score}/${k.max}</span></td></tr>`).join("")}</tbody></table></div>
    <ul class="transits"><li><span class="pill ${mb === mg ? "good" : "warn"}">Mangal dosha</span> ${mtext}</li>
    ${r.kootas[7].score === 0 ? `<li><span class="pill bad">Nadi dosha</span> Same Nadi. Traditionally remedied with Nadi Nivarana puja or Mahamrityunjaya japa.</li>` : ""}
    ${r.kootas[6].score === 0 ? `<li><span class="pill warn">Bhakoot dosha</span> Moon signs fall in a sensitive pair. Often cancelled when sign lords are friends.</li>` : ""}</ul>
  </section></div>`;
}

/* ---------- Plus / pricing / feedback ---------- */
const PARAMS = ["Accuracy", "Ease of use", "Design", "Value for money", "Speed"];
function buyBtn(key, label, primary) {
  const link = PAY_LINKS[key];
  return link ? `<a class="btn${primary ? "" : " ghost"} sm" href="${esc(link)}" target="_blank" rel="noopener">${label}</a>` : `<button class="btn${primary ? "" : " ghost"} sm" data-act="soon">${label}</button>`;
}
function viewPlus() {
  const ratings = store.get("ratings", {});
  const rated = Object.values(ratings).filter(Boolean);
  const ps = planState(), cp = curPlan();
  const feat = {
    free: ["Full Kundli, Lagna and Moon charts", "Daily horoscope, Panchang and week ahead", "36-guna Kundli matching"],
    silver: ["Everything in Free", "Exact dates, peak days and power days in every answer", "Family profiles"],
    gold: ["Everything in Silver", "Yes/No verdicts and date windows", "Priority for new features"],
    unlimited: ["Everything in Gold", "For astrologers and big families", "Add kundlis without limits"],
  };
  const card = (id, best) => {
    const P = PLANS[id], on = ps.id === id;
    return `<div class="plan${best ? " best" : ""}${on ? " on" : ""}">${on ? '<span class="pill good">Your plan</span>' : best ? '<span class="pill good">Most popular</span>' : ""}
      <h3>${P.name}</h3>
      <p class="price">${P.m ? `<span class="num">₹${P.y.toLocaleString("en-IN")}</span> / year<br><span class="save">Just ₹${Math.round(P.y / 12)} a month · save ₹${(P.m * 12 - P.y).toLocaleString("en-IN")}</span><br><span class="muted">or ₹${P.m} month to month</span>` : `<span class="num">₹0</span>`}</p>
      <ul><li><b>${fmtLimit(P.kundlis)}</b> kundli${P.kundlis === 1 ? "" : "s"}</li><li><b>${P.questions === Infinity ? "Unlimited" : P.questions}</b> ${id === "free" ? "free questions to start, then packs from ₹" + QPACKS[0].price : "questions per kundli" + (P.questions === Infinity ? "" : " each month")}</li><li><b>${VOICE_MIN[id]}</b> voice minutes a month</li>${feat[id].map(f => `<li>${f}</li>`).join("")}</ul>
      ${id === "free" ? (on ? `<span class="muted">Included for everyone</span>` : "") : `<div class="row-actions">${buyBtn(id + "-y", "Buy yearly · best value", !on)}${buyBtn(id + "-m", "Monthly", false)}</div>${id === "silver" && !on ? trialBtn() : ""}`}
    </div>`;
  };
  const profs = state.profiles.filter(p => !p.example);
  return `${trialEnded() && ps.id === "free" ? `<div class="banner"><div><strong>Your free trial has ended.</strong> Keep your exact dates and power days with a yearly plan from ₹${Math.round(PLANS.silver.y / 12)} a month.</div></div>` : ""}<section class="card">
      <div class="card-head"><h2>Your plan: ${cp.name}${onTrial() ? " (free trial)" : ""}</h2>${ps.expires ? `<span class="pill good">${onTrial() ? "Trial ends" : "Active until"} ${new Date(ps.expires).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>` : ""}${ps.expired ? `<span class="pill warn">${PLANS[ps.expired].name} plan expired</span>` : ""}</div>
      <dl class="kv"><dt>Questions</dt><dd>${planState().id === "free" ? `<b class="num">${freeLeft()}</b> free left · <b class="num">${qCredits()}</b> credits` : `${qCredits()} extra credits`}</dd><dt>Voice minutes left</dt><dd><b class="num">${fmtMin(voiceLeftSec())}</b></dd><dt>Kundlis saved</dt><dd><b class="num">${kundliCount()}</b> of ${fmtLimit(kundliLimit())}</dd>
      ${(profs.length ? profs : [prof()]).map(p => `<dt>Questions for ${esc(p.name)}</dt><dd>${cp.questions === Infinity ? "Unlimited" : `<b class="num">${usedQ(p.id)}</b> of ${cp.questions} used this month`}</dd>`).join("")}</dl>
      <div class="redeem"><label for="code">Activation code</label><div class="ask"><input id="code" placeholder="TA-XXX-XXXX-XXXX" autocomplete="off" spellcheck="false"><button class="btn" type="button" data-act="redeem">Apply</button></div><p id="code-msg" role="status"></p>
      <p class="note">After payment you receive a code. Enter it here to unlock your plan on this device.</p></div>
    </section>
  <section class="plans four">${card("free")}${card("silver")}${card("gold", true)}${card("unlimited")}</section>
  <section class="card addon"><div><h3>Question packs</h3><p class="muted">No subscription needed: ${QPACKS.map(pk => `${pk.q} questions for ₹${pk.price}`).join(" or ")}. Credits never expire and work for every kundli.</p></div><div class="row-actions">${packButtons()}</div></section>
  <section class="card addon"><div><h3>More voice minutes</h3><p class="muted">Talk to your astrologer in your own language: ${VOICE_PACK_MIN} extra minutes for ₹${VOICE_PACK_PRICE}. They never expire.</p></div>${buyBtn("voicepack", `Add ${VOICE_PACK_MIN} minutes · ₹${VOICE_PACK_PRICE}`, true)}</section>
  <section class="card addon"><div><h3>Need one more kundli?</h3><p class="muted">Add a single kundli slot to any plan for a one-time ₹${ADDON_PRICE}. It never expires.</p></div>${buyBtn("addon", `Add a kundli · ₹${ADDON_PRICE}`, true)}</section>
  <p class="note center" id="soon-msg" role="status"></p>
  <div class="grid">
    <section class="card">
      <h2>Rate Spatik Astro</h2>
      <p class="muted">Your ratings shape what we build next.</p>
      <div class="rate">${PARAMS.map((pr, i) => `<div class="rate-row"><span>${pr}</span><span class="stars" role="radiogroup" aria-label="${pr}">${[1, 2, 3, 4, 5].map(n => `<button role="radio" aria-checked="${ratings[pr] === n}" aria-label="${n} star${n > 1 ? "s" : ""}" class="star${ratings[pr] >= n ? " on" : ""}" data-rate="${pr}" data-n="${n}">★</button>`).join("")}</span></div>`).join("")}</div>
      ${rated.length ? `<p class="avg">Your average: <b class="num">${(rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1)}</b> / 5</p>` : ""}
      ${rated.length && rated.some(x => x <= 3) ? `<label for="fb">What should we fix?</label><textarea id="fb" rows="3" placeholder="Tell us what felt wrong">${esc(store.get("fb", ""))}</textarea>` : ""}
      ${FEEDBACK_URL ? `<a class="btn ghost" href="${FEEDBACK_URL}" target="_blank" rel="noopener">Send detailed feedback</a>` : ""}
    </section>
    ${referralCard()}
    <section class="card">
      <h2>Start as a new person</h2>
      <p class="muted">Erase everything Spatik Astro has saved on this device and see the app the way a first-time visitor does.</p>
      <div class="row-actions"><button class="btn ghost danger" data-act="fresh">Start as a new person</button></div>
    </section>
    <section class="card">
      <h2>Share Spatik Astro</h2>
      <p>Free Kundli, daily horoscope and timed answers. Invite your family and friends.</p>
      <div class="row-actions"><button class="btn" data-act="share-app">Copy invite message</button><span class="copied" id="copied-app" role="status"></span></div>
      <h2 class="mt">How Spatik Astro calculates</h2>
      <p class="muted">Planet positions are computed on your device with standard orbital models (accurate to a few arc-minutes), converted to the sidereal zodiac with the Lahiri ayanamsa used by the Indian government's Rashtriya Panchang. Houses are whole-sign from the Lagna. Dashas follow the Vimshottari system. Astrology is a tool for reflection and guidance.</p>
    </section>
  </div>`;
}

/* ---------- 12-hour time picker ---------- */
function timeFields(px, val, label) {
  let h = "", m = "", ap = "AM";
  if (val) { const [H, M] = val.split(":").map(Number); ap = H >= 12 ? "PM" : "AM"; h = (H % 12) || 12; m = M; }
  const hrs = Array.from({ length: 12 }, (_, i) => i + 1).map(n => `<option value="${n}"${n === h ? " selected" : ""}>${n}</option>`).join("");
  const mins = Array.from({ length: 60 }, (_, i) => i).map(n => `<option value="${n}"${n === m ? " selected" : ""}>${String(n).padStart(2, "0")}</option>`).join("");
  return `<div class="tpick-wrap"><span class="lbl" id="${px}-tlabel">${label}</span><div class="tpick" role="group" aria-labelledby="${px}-tlabel">
    <label class="sr" for="${px}-hh">Hour</label><select id="${px}-hh"><option value="">Hr</option>${hrs}</select>
    <label class="sr" for="${px}-mm">Minute</label><select id="${px}-mm"><option value=""${m === "" ? " selected" : ""}>Min</option>${mins}</select>
    <label class="sr" for="${px}-ap">AM or PM</label><select id="${px}-ap"><option${ap === "AM" ? " selected" : ""}>AM</option><option${ap === "PM" ? " selected" : ""}>PM</option></select>
  </div></div>`;
}
function readTime(px) {
  const h = $(`#${px}-hh`).value; if (!h) return "";
  const m = +($(`#${px}-mm`).value || 0), ap = $(`#${px}-ap`).value;
  let H = (+h) % 12 + (ap === "PM" ? 12 : 0);
  return `${String(H).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function setTime(px, val) {
  if (!val) return;
  const [H, M] = val.split(":").map(Number);
  $(`#${px}-hh`).value = String((H % 12) || 12); $(`#${px}-mm`).value = String(M); $(`#${px}-ap`).value = H >= 12 ? "PM" : "AM";
}

/* ---------- profile form (inline on first visit, modal later) ---------- */
const RELS_LIST = ["Self", "Son", "Daughter", "Wife", "Husband", "Partner", "Mother", "Father", "Brother", "Sister", "Friend", "Other"];
function formFields(p, withRel) {
  const g = p.gender || "";
  return `<label for="f-name">Full name</label><input id="f-name" value="${esc(p.name)}" placeholder="e.g. Priya Sharma" autocomplete="name">
      <div class="${withRel ? "two" : "one"}"><div><span class="lbl" id="f-glabel">Gender</span><input type="hidden" id="f-gender" value="${g}">
        <div class="seg gsel" role="group" aria-labelledby="f-glabel">${[["F", "Female"], ["M", "Male"], ["O", "Other"]].map(([v, l]) => `<button type="button" data-gsel="${v}" aria-pressed="${g === v}"${g === v ? ' class="on"' : ""}>${l}</button>`).join("")}</div></div>
      ${withRel ? `<div><label for="f-rel">Relation to you</label><select id="f-rel">${RELS_LIST.map(r => `<option${(p.relation || "Self") === r ? " selected" : ""}>${r}</option>`).join("")}</select></div>` : `<input type="hidden" id="f-rel" value="Self">`}</div>
      <div class="two"><div><label for="f-date">Date of birth</label><input type="date" id="f-date" value="${p.date}" max="${todayStr()}"></div>
      <div>${timeFields("f", p.unknownTime ? "" : p.time, "Time of birth")}</div></div>
      <label class="check"><input type="checkbox" id="f-unknown"${p.unknownTime ? " checked" : ""}> I don't know my birth time</label>
      ${placeFields("f", p)}`;
}
function openForm(edit) {
  const p = edit ? prof() : { name: "", gender: "", date: "", time: "", place: "", country: "India", state: "", city: "" };
  $("#modal").innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ftitle">
    <h2 id="ftitle">${edit ? "Edit birth details" : "Add birth details"}</h2>
    <p class="muted">Exact birth time gives an accurate Lagna and dasha dates. Your details stay on this device.</p>
    <form id="pform" novalidate>${formFields(p, true)}
      <p class="err" id="f-err" role="alert"></p>
      <div class="row-actions"><button class="btn" type="button" data-act="save-profile">Save and see my chart</button><button class="btn ghost" type="button" data-act="close">Cancel</button>${edit && !p.example ? '<button class="btn ghost danger" type="button" data-act="delete">Delete</button>' : ""}</div>
    </form></div>`;
  $("#modal").hidden = false;
  $("#modal").dataset.edit = edit ? "1" : "";
  setTimeout(() => $("#f-name").focus(), 30);
}
function openLimit() {
  $("#modal").innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ltitle">
    <h2 id="ltitle">Kundli limit reached</h2><p>${limitMsgKundli()}</p>
    <div class="row-actions"><button class="btn" data-goto="plus" data-act="close">See plans</button><button class="btn ghost" data-act="close">Not now</button></div></div>`;
  $("#modal").hidden = false;
}
function alertMsg(text) {
  $("#modal").innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><p>${esc(text)}</p><div class="row-actions"><button class="btn" data-act="close">OK</button></div></div>`;
  $("#modal").hidden = false;
}
function openFresh() {
  const n = state.profiles.filter(p => !p.example).length;
  $("#modal").innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ftitle2">
    <h2 id="ftitle2">Start as a new person?</h2>
    <p>This erases from this device:</p>
    <ul><li>${n} saved kundli${n === 1 ? "" : "s"}</li><li>Your plan, trial and any activation codes applied here</li><li>Report credits, voice minutes and question counts</li><li>Chat, language and voice settings</li></ul>
    <p class="muted">It cannot be undone. Codes already used can be entered again afterwards.</p>
    <div class="row-actions"><button class="btn danger" data-act="fresh-yes">Erase and start fresh</button><button class="btn ghost" data-act="close">Cancel</button></div></div>`;
  $("#modal").hidden = false;
}
function startFresh() {
  try { Object.keys(localStorage).filter(k => k.startsWith("taara.")).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  try { stopVoice(); } catch (e) {}
  Object.assign(state, { profiles: [], active: 0, tab: "today", chat: [], pending: null, lastSubject: null, match: null, openMd: null, openAd: null, openPd: null, lang: "auto", kstyle: null, kmode: "lagna" });
  chartCache.clear();
  for (const k in _hookCount) delete _hookCount[k];
  closeForm(); render(); window.scrollTo(0, 0);
  setTimeout(() => startHere(), 300);
}
function closeForm() { $("#modal").hidden = true; $("#modal").innerHTML = ""; }
/* ---------- birth place: country, state, city ---------- */
function resolvePre(pre) {
  if (pre.country) return { country: pre.country, state: pre.state || "", city: pre.city || "" };
  const hit = pre.place ? findPlace(String(pre.place).split(",")[0], "", "") : null;
  return hit ? { country: hit[2], state: hit[1], city: hit[0] } : { country: "India", state: "", city: "" };
}
function placeFields(px, pre) {
  const r = resolvePre(pre), sts = statesOf(r.country);
  const st = sts.includes(r.state) ? r.state : "";
  const hasCoords = pre.lat !== undefined && pre.lat !== "";
  const tzBase = hasCoords ? +pre.tz : "";
  return `<div class="placebox" id="${px}-placebox">
    <label for="${px}-city">Place of birth (city or town)</label>
    <input id="${px}-city" list="${px}-cities" data-place="${px}" value="${esc(r.city)}" placeholder="Start typing any city: Mumbai, Patna, London…" autocomplete="off">
    <datalist id="${px}-cities">${cityOptions(r.country, st, "")}</datalist>
    <input type="hidden" id="${px}-iana" value="${esc(pre.iana || "")}">
    <p class="note pnote" id="${px}-pnote" role="status"></p>
    <details class="more"${r.country !== "India" ? " open" : ""}><summary>Born outside India, or town not listed?</summary>
      <div class="two">
        <div><label for="${px}-country">Country</label><select id="${px}-country" data-place="${px}">${COUNTRIES.map(c => `<option${c === r.country ? " selected" : ""}>${esc(c)}</option>`).join("")}</select></div>
        <div><label for="${px}-state">State / province</label><select id="${px}-state" data-place="${px}"><option value="">Choose state</option>${sts.map(s => `<option${s === st ? " selected" : ""}>${esc(s)}</option>`).join("")}</select></div>
      </div>
      <div class="three"><div><label for="${px}-lat">Latitude</label><input id="${px}-lat" type="number" step="0.001" value="${hasCoords ? pre.lat : ""}"></div><div><label for="${px}-lon">Longitude</label><input id="${px}-lon" type="number" step="0.001" value="${hasCoords ? pre.lon : ""}"></div><div><label for="${px}-tz">UTC offset</label><input id="${px}-tz" type="number" step="0.01" value="${tzBase}"></div></div>
      <p class="note">Filled in automatically from your city. The time zone, including daylight saving and old historical changes, is worked out for your exact birth date. Change these only if your town is not listed.</p>
    </details>
  </div>`;
}
function cityOptions(country, st, q) {
  const n = norm(q), pool = citiesOf(country, st);
  let list = !n ? pool.slice(0, 60) : [...pool.filter(c => norm(c[0]).startsWith(n)), ...pool.filter(c => !norm(c[0]).startsWith(n) && norm(c[0]).includes(n))].slice(0, 60);
  const dup = new Set(), many = new Set();
  list.forEach(c => { const k = norm(c[0]); dup.has(k) ? many.add(k) : dup.add(k); });
  return list.map(c => `<option value="${esc(many.has(norm(c[0])) || st === "" && pool.length > 60 && c[1] ? c[0] + ", " + c[1] : c[0])}">`).join("");
}
function splitCity(raw, country) {
  const parts = String(raw || "").split(",").map(x => x.trim()).filter(Boolean);
  if (parts.length < 2) return { city: parts[0] || "", state: "" };
  const sts = statesOf(country), st = parts.slice(1).find(x => sts.includes(x)) || "";
  return { city: parts[0], state: st };
}
function setPlaceFields(px, rec, note) {
  const date = ($(`#${px}-date`) || {}).value, time = typeof readTime === "function" ? readTime(px) : "";
  $(`#${px}-lat`).value = rec[3]; $(`#${px}-lon`).value = rec[4];
  $(`#${px}-iana`).value = rec[6] || "";
  const tz = placeTz(rec, date, time); $(`#${px}-tz`).value = isNaN(tz) ? "" : tz;
  if (note !== undefined) $(`#${px}-pnote`).textContent = note;
}
function fillStates(px, country, keep) {
  const sEl = $(`#${px}-state`); sEl.innerHTML = `<option value="">Choose state</option>` + statesOf(country).map(s => `<option${s === keep ? " selected" : ""}>${esc(s)}</option>`).join("");
}
let placeSeq = 0;
function placeChanged(px, which) {
  const cEl = $(`#${px}-country`), sEl = $(`#${px}-state`), cityEl = $(`#${px}-city`);
  if (!cEl) return;
  const seq = ++placeSeq, country = cEl.value;
  if (which === "country") {
    fillStates(px, country, ""); cityEl.value = "";
    if (!PLACE_DATA[country]) { $(`#${px}-pnote`).textContent = "Loading cities…"; loadCountry(country).then(ok => { if ($(`#${px}-country`) && cEl.value === country) { fillStates(px, country, sEl.value); $(`#${px}-cities`).innerHTML = cityOptions(country, sEl.value, ""); $(`#${px}-pnote`).textContent = ok ? "" : "Could not load this country's cities. Type your town and enter its coordinates below."; } }); }
  }
  if (which === "lat" || which === "lon" || which === "tz") { if (which === "tz") $(`#${px}-iana`).value = ""; return; }
  if (which === "date" || which === "ap" || which === "hh" || which === "mm") { const iana = $(`#${px}-iana`).value; if (iana) { const t = tzOffset(iana, $(`#${px}-date`).value, readTime(px)); if (!isNaN(t)) $(`#${px}-tz`).value = t; } return; }
  const { city, state: typedState } = splitCity(cityEl.value, country);
  if (typedState && sEl.value !== typedState) sEl.value = typedState;
  $(`#${px}-cities`).innerHTML = cityOptions(country, which === "city" ? (typedState || "") : sEl.value, city);
  const hit = findPlace(city, sEl.value, country);
  const note = $(`#${px}-pnote`);
  if (hit) {
    if (sEl.value !== hit[1]) { if (![...sEl.options].some(o => o.value === hit[1])) fillStates(px, country, hit[1]); sEl.value = hit[1]; }
    setPlaceFields(px, hit, `✓ ${hit[0]}${hit[1] ? ", " + hit[1] : ""}, ${hit[2]} · ${Math.abs(hit[3]).toFixed(2)}°${hit[3] >= 0 ? "N" : "S"}, ${Math.abs(hit[4]).toFixed(2)}°${hit[4] >= 0 ? "E" : "W"}`);
    return;
  }
  const ref = citiesOf(country, sEl.value)[0] || citiesOf(country)[0];
  if (ref) setPlaceFields(px, ref);
  if (!city) { note.textContent = ""; return; }
  note.textContent = ref ? `Looking for ${city}…` : "";
  const fallback = () => { if (seq !== placeSeq) return; note.textContent = ref ? `${city} is not in our list, so we are using ${ref[0]}${ref[1] ? " (" + ref[1] + ")" : ""}. Pick the nearest town from the suggestions, or open the box below and enter your town's coordinates for an exact Lagna.` : `${city} is not in our list. Choose the country, or enter coordinates below.`; };
  if (norm(city).length < 3) return fallback();
  (PLACE_DATA[country] ? Promise.resolve(false) : loadCountry(country)).then(loaded => {
    if (seq !== placeSeq) return;
    if (loaded) return placeChanged(px, "city2");
    return loadBig().then(big => {
      if (seq !== placeSeq || !big) return fallback();
      const n = norm(city), b = big.find(x => norm(x[0]) === n && x[2] !== country);
      if (!b) return fallback();
      cEl.value = b[2]; fillStates(px, b[2], b[1]); note.textContent = `Found ${b[0]} in ${b[2]}. Loading…`;
      loadCountry(b[2]).then(() => { if (seq !== placeSeq) return; fillStates(px, b[2], b[1]); placeChanged(px, "city2"); });
    });
  });
}
function readPlace(px) {
  const country = $(`#${px}-country`).value, raw = $(`#${px}-city`).value.trim(), st = $(`#${px}-state`).value;
  const city = splitCity(raw, country).city || raw;
  const iana = ($(`#${px}-iana`) || {}).value || "";
  const lat = parseFloat($(`#${px}-lat`).value), lon = parseFloat($(`#${px}-lon`).value);
  const date = ($(`#${px}-date`) || {}).value, time = readTime(px);
  let tz = iana ? tzOffset(iana, date, time) : NaN; if (isNaN(tz)) tz = parseFloat($(`#${px}-tz`).value);
  return { city, state: st, country, dst: false, iana, place: [city, st, country].filter(Boolean).join(", "), lat, lon, tz };
}
function saveForm() {
  const v = id => $("#" + id).value.trim();
  const unknown = $("#f-unknown").checked;
  if (!v("f-city")) { $("#f-err").textContent = "Please enter your city or town of birth."; return; }
  if (!v("f-lat")) placeChanged("f", "city");
  const p = { id: Date.now().toString(36), name: v("f-name"), gender: v("f-gender"), relation: v("f-rel"), date: v("f-date"), time: unknown ? "12:00" : (readTime("f") || "12:00"), unknownTime: unknown || !readTime("f"), ...readPlace("f") };
  if (!p.name || !p.date) { $("#f-err").textContent = "Please enter a name and date of birth."; return; }
  if (isNaN(p.lat) || isNaN(p.lon) || isNaN(p.tz)) { $("#f-err").textContent = "Please choose a country and state, or open Coordinates and time zone to enter them."; return; }
  const edit = $("#modal").dataset.edit === "1" && !prof().example;
  if (edit) { p.id = prof().id; state.profiles[state.active] = p; }
  else { state.profiles.push(p); state.active = state.profiles.length - 1; }
  store.set("profiles", state.profiles); store.set("active", state.active);
  state.chat = []; state.pending = null; state.lastSubject = null; state.match = null; state.openMd = null; state.openAd = null; state.openPd = null;
  if (state.after) { state.tab = state.after; state.after = null; }
  closeForm(); render(); window.scrollTo(0, 0);
}

/* ---------- events ---------- */
function safeSave() {
  try { saveForm(); }
  catch (err) { const el = $("#f-err"); if (el) el.textContent = "Something went wrong while saving. Please check the date, time and place, then try again."; console.error(err); }
}
function doMatch() {
  try { state.match = computeMatch(readPerson("b"), readPerson("g")); render(); }
  catch (err) { console.error(err); }
}
function doAsk() { const el = $("#q"); if (!el) return; const q = el.value; el.value = ""; ask(q); }
async function copy(text, id) {
  const el = $("#" + id);
  try { await navigator.clipboard.writeText(text); if (el) el.textContent = "Copied. Paste it on WhatsApp or Instagram."; }
  catch (e) { if (el) el.textContent = "Copy blocked by the browser. Select and copy manually."; }
}
document.addEventListener("click", e => {
  const t = e.target.closest("button, [data-goto]");
  if (!t) return;
  if (t.dataset.tab) { state.tab = t.dataset.tab; render(); window.scrollTo(0, 0); return; }
  if (t.dataset.goto) { if (!$("#modal").hidden) closeForm(); state.tab = t.dataset.goto; render(); window.scrollTo(0, 0); return; }
  if (t.dataset.gsel !== undefined) { const f = t.closest("form") || document; f.querySelector("#f-gender").value = t.dataset.gsel; t.parentElement.querySelectorAll("button").forEach(b => { b.classList.toggle("on", b === t); b.setAttribute("aria-pressed", b === t); }); return; }
  if (t.dataset.act === "start" || ((t.id === "add-profile" || t.dataset.act === "add") && !hasReal())) return startHere(t.dataset.then);
  if (t.id === "add-profile" || t.dataset.act === "add") { if (kundliCount() >= kundliLimit()) return openLimit(); return openForm(false); }
  if (t.dataset.act === "redeem") { const el = $("#code"), out = $("#code-msg"); redeem(el.value).then(r => { out.textContent = r.msg; out.className = r.ok ? "copied" : "err"; if (r.ok) setTimeout(render, 1200); }); return; }
  if (t.dataset.act === "close") return closeForm();
  if (t.dataset.act === "save-profile") return safeSave();
  if (t.dataset.act === "match") return doMatch();
  if (t.dataset.act === "ask") return doAsk();
  if (t.dataset.act === "pending-save") { try { savePending(); } catch (err) { console.error(err); const el = $("#o-err"); if (el) el.textContent = "Could not save. Please check the details."; } return; }
  if (t.dataset.act === "pending-cancel") { state.pending = null; state.chat.push({ role: "assistant", content: "No problem. Ask again whenever you have the birth details." }); render(); return; }
  if (t.dataset.act === "pending-new") { const pd = state.pending; state.pending = { q: pd.q, rel: pd.rel }; render(); return; }
  if (t.dataset.subj) { const p = profiles().find(x => x.id === t.dataset.subj), pd = state.pending; if (p && pd) { state.pending = null; state.chat.push({ role: "user", content: p.name }); answerFor(pd.q, { profile: p, rel: pd.rel }); } return; }
  if (t.dataset.act === "delete") { state.profiles.splice(state.active, 1); state.active = 0; store.set("profiles", state.profiles); store.set("active", 0); state.chat = []; state.pending = null; state.lastSubject = null; state.match = null; closeForm(); render(); return; }
  if (t.dataset.kstyle) { state.kstyle = t.dataset.kstyle; store.set("kstyle", t.dataset.kstyle); render(); return; }
  if (t.dataset.kmode) { state.kmode = t.dataset.kmode; render(); return; }
  if (t.dataset.md !== undefined) { const i = +t.dataset.md; state.openMd = state.openMd === i ? -1 : i; render(); return; }
  if (t.dataset.ad) { state.openAd = state.openAd === t.dataset.ad ? "-" : t.dataset.ad; state.openPd = "-"; render(); return; }
  if (t.dataset.pd) { state.openPd = state.openPd === t.dataset.pd ? "-" : t.dataset.pd; render(); return; }
  if (t.dataset.q) { ask(t.dataset.q); return; }
  if (t.dataset.rate) { const r = store.get("ratings", {}); r[t.dataset.rate] = +t.dataset.n; store.set("ratings", r); render(); return; }
  if (t.dataset.act === "fresh") return openFresh();
  if (t.dataset.act === "fresh-yes") return startFresh();
  if (t.dataset.act === "mic") return micClick();
  if (t.dataset.speak !== undefined) {
    if (Voice.speaking) { stopVoice(); render(); return; }
    const i = +t.dataset.speak, txt = i >= 0 ? state.chat[i].content : t.closest(".msg").innerText.replace(/Listen$/, "");
    speakAnswer(txt).then(r => { if (r.reason === "limit") { state.chat.push({ role: "assistant", content: `Your voice minutes for this month are used up. Add **${VOICE_PACK_MIN} minutes for ₹${VOICE_PACK_PRICE}** or move to Gold for 30 minutes a month.`, upsell: true }); render(); } else if (r.reason === "novoice") setMicNote(`No ${voiceLang().name} voice is available on this device yet.`); });
    return;
  }
  if (t.dataset.act === "trial") { const r = startTrial(); store.set("inviteSeen", true); state.chat.push({ role: "assistant", content: r.msg }); render(); if (state.tab !== "ask") alertMsg(r.msg); return; }
  if (t.dataset.report) return openReport(t.dataset.report);
  if (t.dataset.act === "report-unlock") { const p = prof(); if (unlockReport(t.dataset.key, p)) openReport(t.dataset.key); return; }
  if (t.dataset.act === "copy-report") return copy(reportText(t.dataset.key), "copied-rep");
  if (t.dataset.act === "print-report") { try { window.print(); } catch (e) {} return; }
  if (t.dataset.act === "share-invite") return copy(inviteText(), "copied-inv");
  if (t.dataset.act === "invite-dismiss") { store.set("inviteSeen", true); render(); return; }
  if (t.dataset.act === "share-power") { const p = prof(), c = chartOf(p), cur = A.currentDasha(c, nowJ()); return copy(`My power days this month from Spatik Astro: ${powerDays(c, [cur.md.lord, cur.ad.lord, cur.pd.lord], 3).map(x => x.label).join(", ")}. Find yours free: ${location.href.split("#")[0]}#ref-${myRefCode().slice(6).toLowerCase()}`, "copied-pow"); }
  if (t.dataset.act === "soon") { { const el = $("#soon-msg"), m = `Online payment is opening soon. ${CONTACT}, and we will send you an activation code.`; if (el && !t.closest("#modal")) el.textContent = m; else { const box = document.createElement("p"); box.className = "note"; box.textContent = m; (t.closest(".lock") || t.parentElement).after(box); } } return; }
  if (t.dataset.act === "share-day") {
    const p = prof(), c = chartOf(p), d = dailyFor(c, todayStr(), deviceTz());
    return copy(`${A.SIGNS[c.moonSign]} Moon · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}\nDay score ${d.s.overall}/100\nLove ${d.s.love} · Career ${d.s.career} · Money ${d.s.money} · Health ${d.s.health}\n${d.text.career}\nLucky colour ${d.lucky.color}, number ${d.lucky.number}\nGet your free Kundli on Spatik Astro: ${location.href.split("#")[0]}`, "copied-day");
  }
  if (t.dataset.act === "share-app") return copy(`I just checked my Kundli and today's horoscope on Spatik Astro. It's free, and the AI astrologer gives answers with real dates. Try it: ${location.href.split("#")[0]}`, "copied-app");
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "vgender") { store.set("voiceGender", t.value); render(); return; }
  if (t.id === "lang") { state.lang = t.value; store.set("lang", t.value); if (!state.chat.length) render(); else { const L = LANG[t.value]; state.chat.push({ role: "assistant", content: L ? `${L.hello}! From now on I will answer in **${L.name}** (${L.native}).` : "I will reply in the language you type in." }); render(); } if (LANG[t.value] && state.kstyle === null) store.set("kstyle", null); return; }
  if (t.id === "profile-select") { state.active = +t.value; store.set("active", state.active); state.chat = []; state.pending = null; state.lastSubject = null; state.match = null; state.openMd = null; state.openAd = null; state.openPd = null; render(); }
  if (t.dataset.pick) {
    const p = state.profiles[+t.value]; if (!p) return; const w = t.dataset.pick;
    $(`#${w}-name`).value = p.name; $(`#${w}-date`).value = p.date; setTime(w, p.time); $(`#${w}-placebox`).outerHTML = placeFields(w, p);
  }
  if (t.dataset.place) placeChanged(t.dataset.place, t.id.split("-").pop());
  if (t.id === "fb") store.set("fb", t.value);
});
document.addEventListener("input", e => { const t = e.target; if (t.dataset.place && t.id.endsWith("-city")) placeChanged(t.dataset.place, "city"); });
document.addEventListener("change", e => { const t = e.target, m = /^(f|o|b|g)-(date|hh|mm|ap|lat|lon|tz)$/.exec(t.id || ""); if (m && $(`#${m[1]}-iana`)) placeChanged(m[1], m[2]); });
document.addEventListener("submit", e => {
  e.preventDefault();
  if (e.target.id === "pform") return safeSave();
  if (e.target.id === "askform") return doAsk();
  if (e.target.id === "matchform") return doMatch();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("#modal").hidden) return closeForm();
  if (e.key !== "Enter" || e.isComposing) return;
  const t = e.target;
  if (t.id === "code") { e.preventDefault(); return $("[data-act=redeem]").click(); }
  if (t.id === "q") { e.preventDefault(); return doAsk(); }
  if (t.tagName === "INPUT" && t.closest("#pendform") && !t.list) { e.preventDefault(); return savePending(); }
  if (t.tagName === "INPUT" && t.closest("#pform") && !t.list) { e.preventDefault(); return safeSave(); }
  if (t.tagName === "INPUT" && t.closest("#matchform") && !t.list) { e.preventDefault(); return doMatch(); }
});
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (TABS.some(t => t[0] === h) && h !== state.tab) { state.tab = h; render(); } });

/* ---------- boot ---------- */
{ const h = location.hash.slice(1); if (TABS.some(t => t[0] === h)) state.tab = h; if (h.startsWith("ref-")) { store.set("invitedBy", h.slice(4)); state.tab = "today"; } }
render();
initAds();
(async () => {
  for (let i = 0; i < 30 && !(window.claude && window.claude.use); i++) await new Promise(r => setTimeout(r, 100));
  if (!(window.claude && window.claude.use)) return;
  try { const s = await window.claude.use("sample"); if (s) { state.sample = s; if (state.tab === "ask") render(); } } catch (e) {}
  try { Voice.claudeTts = await window.claude.use("tts"); } catch (e) {}
  try { Voice.claudeDict = await window.claude.use("dictation"); } catch (e) {}
  if (state.tab === "ask") render();
})();
