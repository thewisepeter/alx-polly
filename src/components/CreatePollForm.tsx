'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trash2, Plus } from "lucide-react";
import { Poll, PollOption } from "../lib/mockData";

interface CreatePollFormProps {
  onCreatePoll: (poll: Poll) => void;
  onCancel: () => void;
}

export function CreatePollForm({ onCreatePoll, onCancel }: CreatePollFormProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    // Validate question
    if (!question.trim()) {
      newErrors.question = "Question is required";
    } else if (question.length < 10) {
      newErrors.question = "Question must be at least 10 characters";
    }

    // Validate options
    const nonEmptyOptions = options.filter(opt => opt.trim());
    if (nonEmptyOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    // Check for duplicate options
    const duplicates = options.filter((opt, index) => 
      opt.trim() && options.indexOf(opt) !== index
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    const pollOptions: PollOption[] = validOptions.map((text, index) => ({
      id: `${Date.now()}_${index}`,
      text: text.trim(),
      votes: 0
    }));

    const newPoll: Poll = {
      id: Date.now().toString(),
      question: question.trim(),
      options: pollOptions,
      totalVotes: 0,
      createdAt: new Date(),
      createdBy: '', // Will be set by the parent component
      isActive: true
    };

    onCreatePoll(newPoll);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Poll</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <div>
              <Label htmlFor="question">Poll Question</Label>
              <Input
                id="question"
                type="text"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={errors.question ? "border-destructive" : ""}
              />
              {errors.question && (
                <p className="text-sm text-destructive mt-1">{errors.question}</p>
              )}
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

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Poll
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}