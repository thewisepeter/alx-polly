'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PollFormProps = {
  onSubmit: (data: {
    title: string;
    description: string;
    options: string[];
  }) => void;
};

export function PollForm({ onSubmit }: PollFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Maintain at least 2 options
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      options: options.filter(option => option.trim() !== ''),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Poll Title</Label>
        <Input 
          id="title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter poll title" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input 
          id="description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter poll description" 
        />
      </div>
      
      <div className="space-y-4">
        <Label>Poll Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
            />
            {options.length > 2 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => removeOption(index)}
                className="shrink-0"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button 
          type="button" 
          variant="outline" 
          onClick={addOption}
          className="w-full"
        >
          Add Option
        </Button>
      </div>
      
      <Button type="submit" className="w-full">Create Poll</Button>
    </form>
  );
}