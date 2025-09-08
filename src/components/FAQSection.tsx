import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useFAQs } from "@/hooks/useFAQs";
import { MessageCircle } from "lucide-react";

const FAQSection = () => {
  const { faqs, loading, getCategories } = useFAQs();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = getCategories();
  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 bg-muted rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null; // Don't render if no FAQs
  }

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our plugins, services, and support.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => setSelectedCategory('all')}
              >
                All Questions
              </Badge>
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors capitalize"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace(/[_-]/g, ' ')}
                </Badge>
              ))}
            </div>
          )}

          {/* FAQ Accordion */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Questions & Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-start gap-3">
                          <span className="text-base font-medium">{faq.question}</span>
                          {faq.category !== 'general' && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {faq.category.replace(/[_-]/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        <div className="pt-2">
                          {faq.answer.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-2 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions found in this category.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;