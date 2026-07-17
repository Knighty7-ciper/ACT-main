import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Twitter, Linkedin, Facebook, Link as LinkIcon, ChevronRight, MessageCircle, ThumbsUp, Globe, Zap, Shield, TrendingUp } from 'lucide-react';

const BlogPostPage = () => {
  const { id } = useParams();

  // Article images mapping
  const articleImages = {
    1: '/images/blog/featured-hero.jpg',
    2: '/images/blog/article-blockchain.jpg',
    3: '/images/blog/article-defi.jpg',
    4: '/images/blog/article-africa.jpg',
    5: '/images/blog/blockchain-tech.jpg',
    6: '/images/blog/bitcoin-crypto.jpg',
  };

  // Related articles
  const relatedArticles = [
    { id: 2, title: 'Understanding the Basket Algorithm', category: 'Technology', readTime: '12 min' },
    { id: 3, title: 'The Economic Case for a Continental Stable Value Layer', category: 'Economics', readTime: '10 min' },
    { id: 5, title: 'Transparency in Practice: Open Source and Public Ledgers', category: 'Technology', readTime: '7 min' },
  ];

  const posts = {
    1: {
      title: 'Introducing Pesa-Afrik: Financial Sovereignty for Africa',
      subtitle: 'A vision for restoring fairness to value exchange across the African continent through innovative blockchain technology and PPP-based stability',
      author: 'Brian Kiarie',
      role: 'Founder & CEO',
      date: '2024-12-15',
      readTime: '8 min read',
      category: 'Introduction',
      image: articleImages[1],
      featured: true,
      content: (
        <div className="prose prose-lg prose-slate max-w-none">
          {/* Author's Note */}
          <div className="not-prose mb-8 md:mb-10 p-4 md:p-6 bg-gradient-to-r from-primary-50 to-gold-50 rounded-xl md:rounded-2xl border-l-4 border-primary-600">
            <p className="text-slate-700 italic text-sm md:text-lg">
              "This is more than a cryptocurrency project. It's an experiment in financial sovereignty for a continent 
              that's been marginalized by global financial systems. Every transaction, every savings account, every 
              merchant adoption represents a vote for a more inclusive financial future."
            </p>
            <p className="text-slate-500 mt-3 text-xs md:text-sm">— Brian Kiarie, Founder & CEO</p>
          </div>

          <h2 className="text-xl md:text-2xl">The Problem with Traditional Money in Africa</h2>
          <p>
            Across Africa, millions of people face a persistent challenge: their money loses value faster than they can earn it. 
            Inflation rates averaging 10-30% annually in many countries erode savings, complicate planning, and limit economic opportunity. 
            At the same time, traditional banking services remain inaccessible to large portions of the population.
          </p>
          <p>
            Remittances, which serve as a lifeline for millions of families, face fees of 7-20% per transaction. 
            Cross-border trade is hampered by currency exchange complications and regulatory barriers. 
            The result is a continent rich in human potential but constrained by financial infrastructure designed elsewhere.
          </p>

          <div className="not-prose my-6 md:my-8 p-4 md:p-6 bg-slate-900 rounded-xl md:rounded-2xl text-white">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2 md:p-3 bg-primary-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Zap className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-2">The African Financial Reality</h4>
                <ul className="space-y-1.5 md:space-y-2 text-slate-300 text-sm md:text-base">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0" />
                    40% of African adults lack access to formal banking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0" />
                    Average intra-African remittance fees: 8-15%
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0" />
                    54 of 55 African nations have inflation above 3%
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl">Our Vision: Purchasing Power as Foundation</h2>
          <p>
            Pesa-Afrik takes a fundamentally different approach. Instead of pegging to a volatile foreign currency or relying on centralized reserves, 
            we anchor value to a basket of essential commodities across 10 African countries. This basket includes:
          </p>
          <ul>
            <li><strong>Staple foodstuffs</strong> (maize, rice, wheat)</li>
            <li><strong>Energy resources</strong> (crude oil, electricity)</li>
            <li><strong>Construction materials</strong> (cement, steel)</li>
            <li><strong>Essential services</strong> (healthcare, education)</li>
          </ul>
          <p>
            By measuring purchasing power in terms of real goods and services that people actually need, 
            Pesa-Afrik maintains stable value regardless of which national currency you're using or sending between.
          </p>

          <h2 className="text-xl md:text-2xl">How It Works</h2>
          <p>
            Our proprietary Basket Algorithm continuously monitors commodity prices across major African markets, 
            weighted by their importance to everyday life. This data, sourced from public exchanges and verified oracle networks, 
            feeds into our smart contract system to maintain the peg.
          </p>
          <p>
            The result is a cryptocurrency that behaves like a "stablecoin" but without relying on any single fiat currency. 
            Whether you're in Nigeria, Kenya, Ghana, or South Africa, 1 Pesa-Afrik buys approximately the same basket of goods.
          </p>

          <div className="not-prose my-6 md:my-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: Globe, title: 'Borderless', desc: 'Send anywhere in Africa instantly' },
              { icon: Shield, title: 'Stable', desc: 'Anchored to real purchasing power' },
              { icon: TrendingUp, title: 'Transparent', desc: 'All code and data publicly auditable' },
            ].map((item, i) => (
              <div key={i} className="p-4 md:p-6 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm md:text-base">{item.title}</h4>
                <p className="text-xs md:text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl md:text-2xl">Real Impact for Real People</h2>
          <p>
            This isn't theoretical. We're already seeing merchants in border regions use Pesa-Afrik to accept payments from neighboring countries. 
            Families are saving in Pesa-Afrik to protect against local currency depreciation. 
            Small businesses are accepting cross-border orders without worrying about exchange rate fluctuations.
          </p>
          <p>
            The technology is simply the enabler. The real transformation comes from the people who use it to build better economic lives.
          </p>

          <h2 className="text-xl md:text-2xl">Join the Movement</h2>
          <p>
            Pesa-Afrik is more than a cryptocurrency project. It's an experiment in financial sovereignty for a continent that's been 
            marginalized by global financial systems. Every transaction, every savings account, every merchant adoption 
            represents a vote for a more inclusive financial future.
          </p>
          <p>
            We're just getting started. The best is yet to come.
          </p>
        </div>
      ),
    },
    2: {
      title: 'Understanding the Basket Algorithm: How PPP Powers Pesa-Afrik',
      subtitle: 'Deep dive into our proprietary algorithm that calculates purchasing power parity across 10 African countries using real commodity prices',
      author: 'Kofi Mensah',
      role: 'Chief Technology Officer',
      date: '2024-12-10',
      readTime: '12 min read',
      category: 'Technology',
      image: articleImages[2],
      featured: false,
      content: (
        <div className="prose prose-lg prose-slate max-w-none">
          <p className="lead text-base md:text-xl text-slate-600 mb-6 md:mb-8">
            The Basket Algorithm is the heart of Pesa-Afrik's value proposition. Here we explain how it works, 
            why it matters, and how it maintains stable purchasing power across diverse African markets.
          </p>

          <h2 className="text-xl md:text-2xl">What is Purchasing Power Parity?</h2>
          <p>
            Purchasing Power Parity (PPP) is an economic theory that suggests currencies should equalize in terms of 
            what they can purchase. A burger that costs $5 in New York should cost approximately the same in Nairobi 
            when converted at the right exchange rate.
          </p>
          <p>
            In practice, PPP adjustments reveal that many African currencies are significantly over or undervalued 
            compared to official exchange rates. Our algorithm leverages this insight to create a value reference 
            that reflects real purchasing power rather than currency market speculation.
          </p>

          <h2 className="text-xl md:text-2xl">How We Measure the Basket</h2>
          <p>
            Our basket consists of 20 carefully selected commodities and services that represent essential needs 
            across African populations:
          </p>
          <ul>
            <li><strong>Food items:</strong> Maize, rice, wheat flour, cooking oil, sugar, beans</li>
            <li><strong>Energy:</strong> Gasoline, diesel, electricity tariffs, cooking gas</li>
            <li><strong>Housing:</strong> Rent indices, construction costs</li>
            <li><strong>Healthcare:</strong> Essential medicines, hospital fees</li>
            <li><strong>Education:</strong> School fees, textbooks</li>
            <li><strong>Transport:</strong> Public transport costs, fuel</li>
          </ul>
          <p>
            These items are weighted based on their share of average household expenditure across our target countries, 
            with data updated daily from national statistics offices and commodity exchanges.
          </p>

          <h2 className="text-xl md:text-2xl">The Algorithm in Action</h2>
          <p>
            Every hour, the algorithm performs the following calculations:
          </p>
          <ol>
            <li>Collect current prices for all basket items in local currencies</li>
            <li>Convert to a common reference currency using verified exchange rates</li>
            <li>Apply country-specific weights based on consumption patterns</li>
            <li>Calculate the weighted average basket price</li>
            <li>Adjust the Pesa-Afrik supply through algorithmic rebasing if needed</li>
          </ol>
          <p>
            This continuous adjustment ensures that 1 Pesa-Afrik maintains consistent purchasing power 
            regardless of which national currency you use to measure it.
          </p>

          <h2 className="text-xl md:text-2xl">Transparency and Verification</h2>
          <p>
            We believe trust requires transparency. All price data feeds are publicly verifiable through our oracle network. 
            The algorithm code is open source and auditable. Historical calculations are recorded on-chain for anyone to review.
          </p>

          <h2 className="text-xl md:text-2xl">Future Enhancements</h2>
          <p>
            We're currently working to expand the basket to include 5 additional countries and 
            15 more commodity categories. We also plan to implement machine learning models 
            to detect and filter anomalous price data before it affects the calculation.
          </p>
        </div>
      ),
    },
    3: {
      title: 'The Economic Case for a Continental Stable Value Layer',
      subtitle: 'How a basket-backed cryptocurrency can reduce remittance costs, hedge against inflation, and facilitate cross-border trade across Africa',
      author: 'Dr. Sarah Chen',
      role: 'Head of Economics',
      date: '2024-12-05',
      readTime: '10 min read',
      category: 'Economics',
      image: articleImages[3],
      featured: false,
      content: (
        <div className="prose prose-lg prose-slate max-w-none">
          <p className="lead text-base md:text-xl text-slate-600 mb-6 md:mb-8">
            Africa loses billions annually to remittance fees, inflation erosion, and trade inefficiencies. 
            A continental stable value layer could change that.
          </p>

          <h2 className="text-xl md:text-2xl">The $50 Billion Remittance Problem</h2>
          <p>
            Africa receives over $50 billion in remittances annually, with Nigeria, Ghana, Kenya, and Ethiopia 
            among the top recipient countries. But sending money across African borders remains shockingly expensive.
          </p>
          <p>
            The average cost of sending $200 within Africa ranges from 8-15%, compared to 3-5% for intercontinental transfers. 
            This "internal remittance premium" means families receiving money from relatives in neighboring countries 
            pay more than those receiving from overseas.
          </p>
          <p>
            Pesa-Afrik can reduce these costs to near zero. A worker in Lagos can send value instantly to family in Nairobi 
            without any currency conversion, no correspondent banking fees, no waiting days for settlement.
          </p>

          <h2 className="text-xl md:text-2xl">Inflation Hedging for Savers</h2>
          <p>
            Average inflation across Sub-Saharan Africa has hovered around 12% annually in recent years, 
            with some countries experiencing periods of hyperinflation exceeding 100%. For ordinary savers, 
            this means their money loses value rapidly.
          </p>
          <p>
            Pesa-Afrik provides an alternative. By maintaining purchasing power against a basket of real goods, 
            it protects savings without requiring access to foreign currency accounts or complex financial instruments.
          </p>

          <h2 className="text-xl md:text-2xl">Cross-Border Trade Enablement</h2>
          <p>
            Intra-African trade accounts for only 15% of the continent's total trade, far below the 70% intra-regional 
            trade seen in Europe. Multiple currency conversions, exchange rate risk, and payment delays all contribute to this gap.
          </p>
          <p>
            With Pesa-Afrik as a medium of exchange, a Kenyan manufacturer can price their goods in Pesa-Afrik, 
            accept payment from Nigerian buyers, and use those funds to purchase South African inputs—all without 
            currency risk or conversion fees.
          </p>

          <h2 className="text-xl md:text-2xl">Macroeconomic Implications</h2>
          <p>
            Widespread adoption of a stable value layer could have profound effects on African monetary policy, 
            foreign reserve management, and financial integration. Central banks might choose to hold Pesa-Afrik 
            as part of their reserves. Payment systems could settle instantly across borders.
          </p>
          <p>
            We're not suggesting Pesa-Afrik replaces national currencies. But as a neutral, transparent, 
            and accessible stable value layer, it can complement existing monetary systems and fill gaps 
            they've left open.
          </p>
        </div>
      ),
    },
    4: {
      title: 'From Lagos to Nairobi: Real Stories of Cross-Border Value Transfer',
      subtitle: 'Meet the merchants, workers, and families who are already using Pesa-Afrik to send value across African borders instantly',
      author: 'Grace Mwangi',
      role: 'Community Manager',
      date: '2024-11-28',
      readTime: '6 min read',
      category: 'Community',
      image: articleImages[4],
      featured: false,
      content: (
        <div className="prose prose-lg prose-slate max-w-none">
          <p className="lead text-base md:text-xl text-slate-600 mb-6 md:mb-8">
            Technology means nothing without the people it serves. Here are three stories of people 
            already using Pesa-Afrik to transform their cross-border financial lives.
          </p>

          <h2 className="text-xl md:text-2xl">Adaora: Small Business Owner, Lagos to Accra</h2>
          <p>
            Adaora runs a wholesale fabric business connecting Nigerian textile producers with Ghanaian retailers. 
            Before Pesa-Afrik, each transaction meant multiple currency conversions, bank delays of 3-5 days, 
            and fees that ate into her margins.
          </p>
          <p>
            "Now I receive payment in Pesa-Afrik from my Ghana clients, and I can immediately use those funds 
            to pay my Nigerian suppliers," Adaora explains. "What used to take a week and cost me 8% now takes 
            minutes and costs less than 1%."
          </p>
          <p>
            She's expanded her business to include Kenyan clients and credits the instant cross-border 
            settlement for making it possible to manage a more complex supply chain.
          </p>

          <h2 className="text-xl md:text-2xl">Kwame: Construction Worker, Kumasi to Nairobi</h2>
          <p>
            Kwame works on construction sites across East and West Africa. He's supporting his wife and three children 
            in Nairobi while working on a project in Ghana. Previously, sending money home meant expensive money transfer 
            services and anxious waits for confirmation.
          </p>
          <p>
            "My wife downloads Pesa-Afrik on her phone in Nairobi. I buy it with Cedis from my wages in Ghana, 
            send it instantly, and she has it ready to spend on food and school fees in Kenya Shillings," Kwame says.
          </p>
          <p>
            The savings on transfer fees alone have allowed Kwame to increase the amount he sends home 
            while keeping more for his own living expenses.
          </p>

          <h2 className="text-xl md:text-2xl">Fatima: Student, Casablanca to Multiple Countries</h2>
          <p>
            Fatima is a university student whose family spans three countries—her parents in Morocco, 
            her sister in Egypt, and her brother working in Dubai. Managing financial support from multiple 
            sources to her single bank account in Morocco was complicated.
          </p>
          <p>
            "Now my family can all send Pesa-Afrik regardless of where they are, and I receive it in Morocco 
            and convert to dirhams when I need to," Fatima explains. "It's like we're all using the same 
            currency even though we're in different countries."
          </p>

          <h2 className="text-xl md:text-2xl">Building Together</h2>
          <p>
            These stories represent the early days of what's possible when financial infrastructure catches up 
            with the realities of African life. People have always moved across borders and maintained economic 
            connections. Pesa-Afrik simply makes that easier, faster, and cheaper.
          </p>
          <p>
            We share these stories not to celebrate our technology, but to honor the people who are building 
            their futures with it.
          </p>
        </div>
      ),
    },
    5: {
      title: 'Transparency in Practice: Open Source and Public Ledgers',
      subtitle: 'Why we chose to make all our smart contracts and oracle data publicly auditable. Trust through verification, not promises.',
      author: 'Kofi Mensah',
      role: 'Chief Technology Officer',
      date: '2024-11-20',
      readTime: '7 min read',
      category: 'Technology',
      image: articleImages[5],
      featured: false,
      content: (
        <div className="prose prose-lg prose-slate max-w-none">
          <p className="lead text-base md:text-xl text-slate-600 mb-6 md:mb-8">
            In traditional finance, trust is enforced through regulation and institutions. 
            In crypto, trust is verified through code and transparency. We take this seriously.
          </p>

          <h2 className="text-xl md:text-2xl">Our Transparency Commitments</h2>
          <p>
            Pesa-Afrik operates on three pillars of transparency:
          </p>
          <ul>
            <li><strong>Open Source Code:</strong> All smart contracts are publicly available on GitHub</li>
            <li><strong>Public Oracle Data:</strong> Every price feed is recorded on-chain and verifiable</li>
            <li><strong>Decentralized Governance:</strong> Protocol changes require community approval</li>
          </ul>

          <h2 className="text-xl md:text-2xl">What This Means in Practice</h2>
          <p>
            Anyone can audit our code to verify that:
          </p>
          <ul>
            <li>The basket algorithm calculates values correctly</li>
            <li>No hidden admin keys exist that could manipulate the supply</li>
            <li>Oracle data feeds come from multiple independent sources</li>
          </ul>
          <p>
            This isn't a marketing claim—it's enforced by the immutable nature of blockchain technology. 
            The code does exactly what it says, nothing more, nothing less.
          </p>

          <h2 className="text-xl md:text-2xl">Building Trust in a Trustless Environment</h2>
          <p>
            We're often asked why we'd make our code public if competitors could copy it. 
            Our answer: the value isn't in the code, it's in the network, the community, and the trust we've built.
          </p>
          <p>
            Making our code auditable means users can verify our claims independently. 
            They don't have to trust us—they can verify.
          </p>
        </div>
      ),
    },
    6: {
      title: 'Inflation Hedging Strategies for African Savers',
      subtitle: 'Practical guide on how Pesa-Afrik can protect your savings against currency devaluation and maintain purchasing power over time',
      author: 'Dr. Sarah Chen',
      role: 'Head of Economics',
      date: '2024-11-15',
      readTime: '9 min read',
      category: 'Economics',
      image: articleImages[6],
      featured: false,
      content: (
        <div className="prose prose-lg prose-slate max-w-none">
          <p className="lead text-base md:text-xl text-slate-600 mb-6 md:mb-8">
            Currency devaluation is a silent thief. It takes your savings bit by bit, 
            without you noticing until it's too late. Here's how Pesa-Afrik can help protect what you've earned.
          </p>

          <h2 className="text-xl md:text-2xl">Understanding Inflation's Impact</h2>
          <p>
            If you save 100,000 Naira today and inflation runs at 20% annually, 
            in one year your 100,000 will only buy 83,333 Naira worth of goods. 
            In five years, you'll need 248,832 Naira to buy what 100,000 buys today.
          </p>
          <p>
            Traditional savings accounts rarely keep pace with inflation in African markets. 
            Fixed deposits offer rates of 5-10% while inflation runs at 15-30%. 
            The result is a slow erosion of purchasing power.
          </p>

          <h2 className="text-xl md:text-2xl">How Pesa-Afrik Helps</h2>
          <p>
            By maintaining purchasing power against a basket of essential goods, 
            Pesa-Afrik offers savers a way to preserve value without needing access to 
            foreign currency accounts or complex financial instruments.
          </p>
          <ul>
            <li><strong>Preserve Purchasing Power:</strong> Your savings maintain their ability to buy real goods</li>
            <li><strong>No Conversion Friction:</strong> Save directly in Pesa-Afrik without currency exchange</li>
            <li><strong>Accessibility:</strong> No minimum balances or credit requirements</li>
          </ul>

          <h2 className="text-xl md:text-2xl">Practical Strategies</h2>
          <ol>
            <li><strong>Regular Small Saves:</strong> Convert excess local currency to Pesa-Afrik as you receive it</li>
            <li><strong>Emergency Fund:</strong> Keep 3-6 months of expenses in Pesa-Afrik for quick access</li>
            <li><strong>Cross-Border Savings:</strong> If you earn in multiple currencies, consolidate in Pesa-Afrik</li>
          </ol>

          <h2 className="text-xl md:text-2xl">Important Considerations</h2>
          <p>
            Pesa-Afrik isn't an investment—it's a preservation tool. It won't make you rich, 
            but it can help ensure your savings don't make you poor over time. 
            Always maintain a diversified approach to financial security.
          </p>
        </div>
      ),
    },
  };

  const post = posts[id];
  const postId = parseInt(id);

  if (!post) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 pb-16 bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Article Not Found</h1>
          <p className="text-slate-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-14 pb-12 md:pt-16 md:pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900" />
        </div>

        {/* Animated Elements - Hide on mobile */}
        <div className="absolute inset-0 overflow-hidden hidden sm:block">
          <div className="absolute top-20 right-20 w-56 md:w-72 h-56 md:h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-64 md:w-96 h-64 md:h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Back Link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 md:mb-8 transition-colors group text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>

            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs md:text-sm font-medium mb-4 md:mb-6">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              {post.category}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 md:mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-xl text-white/70 mb-5 md:mb-8 leading-relaxed max-w-2xl">
              {post.subtitle}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white/60 text-xs md:text-sm">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                {post.readTime}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl md:rounded-3xl shadow-lg md:shadow-xl border border-slate-100 overflow-hidden"
        >
          {/* Author Card */}
          <div className="p-4 md:p-8 border-b border-slate-100 bg-gradient-to-r from-primary-50/50 to-gold-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative flex-shrink-0">
                  <img 
                    src="/images/culture-afrik.jpeg" 
                    alt={post.author}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-lg"
                  />
                  {post.featured && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-primary-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Zap className="w-2 h-2 md:w-3 md:h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm md:text-lg">{post.author}</p>
                  <p className="text-primary-600 font-medium text-xs md:text-sm">{post.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-start sm:justify-end">
                <button className="p-2 md:p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg md:rounded-xl transition-all">
                  <ThumbsUp className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="p-2 md:p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg md:rounded-xl transition-all">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="p-2 md:p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg md:rounded-xl transition-all">
                  <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="p-2 md:p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg md:rounded-xl transition-all">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-4 md:p-8 lg:p-12">
            {post.content}
          </div>

          {/* Tags */}
          <div className="px-4 md:px-8 pb-4 md:pb-8">
            <div className="flex flex-wrap gap-2">
              {['Pesa-Afrik', 'Cryptocurrency', 'Africa', 'Blockchain', 'Financial Inclusion'].map((tag, i) => (
                <span 
                  key={i}
                  className="px-2.5 py-1 md:px-3 md:py-1 bg-slate-100 text-slate-600 rounded-full text-xs md:text-sm hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Share Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 md:mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl md:rounded-2xl p-5 md:p-8 text-center"
        >
          <h3 className="text-white font-bold text-lg md:text-xl mb-3 md:mb-4">Share this article</h3>
          <p className="text-primary-200 mb-4 md:mb-6 text-sm md:text-base">Spread the word about financial sovereignty for Africa</p>
          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl transition-all text-white hover:scale-110"
            >
              <Twitter className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl transition-all text-white hover:scale-110"
            >
              <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl transition-all text-white hover:scale-110"
            >
              <Facebook className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="p-2.5 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl transition-all text-white hover:scale-110"
            >
              <LinkIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </motion.div>

        {/* Related Articles */}
        <div className="mt-8 md:mt-12">
          <h3 className="text-lg md:text-2xl font-display font-bold text-slate-900 mb-4 md:mb-8 flex items-center gap-2">
            <span className="w-1 h-6 md:h-8 bg-primary-600 rounded-full" />
            Related Articles
          </h3>
          {/* Stack on mobile, 3 columns on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {relatedArticles.filter(article => article.id !== postId).slice(0, 3).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link 
                  to={`/blog/${article.id}`}
                  className="group block bg-white rounded-xl md:rounded-2xl border border-slate-200 overflow-hidden hover:border-primary-200 hover:shadow-lg transition-all"
                >
                  <div className="h-28 md:h-32 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                      <span className="text-primary-600 font-semibold text-center text-xs md:text-sm">{article.category}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                  </div>
                  <div className="p-3 md:p-5">
                    <h4 className="font-semibold text-slate-900 mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm md:text-base">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 md:mt-12 bg-slate-900 rounded-xl md:rounded-3xl p-5 md:p-10 lg:p-12 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-primary-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-gold-500 rounded-full translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative text-center max-w-xl mx-auto">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white mb-3 md:mb-4">
              Stay Updated
            </h3>
            <p className="text-slate-400 mb-5 md:mb-8 text-sm md:text-base">
              Get the latest insights on African finance and Pesa-Afrik development delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 md:py-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:border-white/40 text-sm md:text-base"
              />
              <button
                type="submit"
                className="px-5 py-2.5 md:px-6 md:py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg md:rounded-xl transition-colors shadow-lg text-sm md:text-base"
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </article>
    </div>
  );
};

export default BlogPostPage;