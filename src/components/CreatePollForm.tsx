'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/contexts/AuthContext";

interface CreatePollFormProps {
  onCancel: () => void;
}

export function CreatePollForm({ onCancel, }: CreatePollFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isPublic, setIsPublic] = useState(true);
  const [allowAnonymousVotes, setAllowAnonymousVotes] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Poll title is required";
    } else if (title.length < 5) {
      newErrors.title = "Poll title must be at least 5 characters";
    }

    // Validate options
    const nonEmptyOptions = options.filter(opt => opt.trim());
    if (nonEmptyOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    // Check for duplicate options
    const duplicates = options.filter((opt, index) => 
      opt.trim() && options.findIndex(o => o.trim() === opt.trim()) !== index
    );
    if (duplicates.length > 0) {
      newErrors.options = "Options must be unique";
    }

    // Check individual option length
    options.forEach((opt, index) => {
      if (opt.trim() && opt.length > 100) {
        newErrors[`option_${index}`] = "Option must be less than 100 characters";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
     if (!user) {
      setErrors({ form: "You must be signed in to create a poll" });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    
      // Create FormData object
      
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('isPublic', isPublic.toString());
      formData.append('allowAnonymousVotes', allowAnonymousVotes.toString());
      
      // Add options
      const validOptions = options.filter(opt => opt.trim());
      validOptions.forEach((option, index) => {
        formData.append(`option-${index}`, option.trim());
      });
      
      try {
      console.log('handleSubmit function called');
      const response = await fetch('/api/polls', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('API Response Status:', response.status, response.statusText);

      let result;
      try {
        result = await response.json();
        console.log('API Response Result:', result); // Add this line for debugging
      } catch (jsonError) {
        const text = await response.text();
        console.error('JSON parsing error:', jsonError);
        console.error('Raw API Response Text:', text);
        setErrors({ form: 'Failed to parse API response' });
        setIsSubmitting(false);
        return;
      }
      
      if (response.ok && result.poll && result.poll.length > 0) {
        toast({
          title: "Poll created successfully",
          description: "Your poll has been created and is now available.",
        });
        
        // Redirect to the poll page
        router.push(`/poll/${result.poll[0].id}`);
      } else {
        setErrors({ form: result.error || 'Failed to create poll' });
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Poll</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Error Message */}
            {errors.form && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {errors.form}
              </div>
            )}
            
            {/* Title Input */}
            <div>
              <Label htmlFor="title">Poll Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="What would you like to ask?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>
            
            {/* Description Input */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about your poll"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
              />
            </div>

            {/* Options */}
            <div>
              <Label>Poll Options</Label>
              <div className="space-y-3 mt-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className={errors[`option_${index}`] ? "border-destructive" : ""}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {options.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
              
              {errors.options && (
                <p className="text-sm text-destructive mt-1">{errors.options}</p>
              )}
            </div>

            {/* Poll Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPublic" 
                  checked={isPublic} 
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="isPublic">Make this poll public</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allowAnonymousVotes" 
                  checked={allowAnonymousVotes} 
                  onCheckedChange={(checked) => setAllowAnonymousVotes(checked as boolean)}
                />
                <Label htmlFor="allowAnonymousVotes">Allow anonymous votes</Label>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Poll"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}