import { saveQuotation } from '../src/app/(dashboard)/clients/actions';

async function test() {
  const items = [
    { id: '1', name: "Discovery & Strategy", price: 15000, qty: 1, taxRate: 18 }
  ];
  const termsObj = {
    introMessage: "Hello",
    scopeOfWork: ["Phase 1"],
    complimentary: ["SEO"],
    timelineAndTerms: [{ label: "Time", value: "6 weeks" }],
    notIncluded: "Nothing"
  };
  
  const res = await saveQuotation(1, items, 15000, 2700, 17700, JSON.stringify(termsObj));
  console.log("Result:", res);
  process.exit(0);
}

test();
