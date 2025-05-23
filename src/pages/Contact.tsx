// src/pages/RequestTrial.tsx
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation schema with zod
const trialFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email" }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  trialType: z.string().min(1, { message: "Select a trial type" }),
  comments: z.string().min(10, { message: "Comments must be at least 10 characters" }),
});

type TrialFormValues = z.infer<typeof trialFormSchema>;

const RequestTrial = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<TrialFormValues>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      trialType: "",
      comments: "",
    },
  });

  function onSubmit(data: TrialFormValues) {
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      console.log("Trial request data:", data);
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Request submitted successfully", {
        description: "We will contact you soon to activate your trial.",
      });
    }, 1500);
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Request Trial</h1>
        <p className="text-muted-foreground">Complete the form to gain trial access</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="border border-border rounded-lg p-6 bg-tmcdark-card">
          <h2 className="text-xl font-medium mb-4">Your Company Details</h2>
          <p className="text-muted-foreground mb-6">
            Tell us about your organization and how you plan to use our software.
          </p>

          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100/10 mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest. We will contact you soon with your trial details.
              </p>
              <Button onClick={() => setIsSubmitted(false)}>Submit Another Request</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="your@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trialType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trial Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic (7 days)</SelectItem>
                          <SelectItem value="pro">Pro (14 days)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (30 days)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more about your use case..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Request Trial"}
                </Button>
              </form>
            </Form>
          )}
        </div>

        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6 bg-tmcdark-card">
            <h2 className="text-xl font-medium mb-4">Why Try It?</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Real-time monitoring of your mining farm.</li>
              <li>Secure remote access via tunnel.</li>
              <li>Intuitive and customizable dashboard.</li>
              <li>Detailed setup guide.</li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-6 bg-tmcdark-card">
            <h2 className="text-xl font-medium mb-4">Support</h2>
            <p className="text-muted-foreground mb-4">
              All trial users receive support via email.
            </p>
            <Button variant="outline" className="w-full">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RequestTrial;