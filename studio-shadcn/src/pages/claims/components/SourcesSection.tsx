import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { MinusCircle, Plus } from "lucide-react";

const SourcesSection = ({
  claimSourcesArray,
  reviewSourcesArray,
  form,
  setValueChange,
}) => {
  const [showClaimInputs, setShowClaimInputs] = useState(false);
  const [showReviewInputs, setShowReviewInputs] = useState(false);
  const [newClaimSource, setNewClaimSource] = useState({
    url: "",
    description: "",
  });
  const [newReviewSource, setNewReviewSource] = useState({
    url: "",
    description: "",
  });

  const handleAddClaimSource = () => {
    claimSourcesArray.append(newClaimSource);
    setNewClaimSource({ url: "", description: "" });
    setShowClaimInputs(false);
    setValueChange(true);
  };

  const handleAddReviewSource = () => {
    reviewSourcesArray.append(newReviewSource);
    setNewReviewSource({ url: "", description: "" });
    setShowReviewInputs(false);
    setValueChange(true);
  };

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claim Sources Column */}
        <div>
          <h3 className="font-medium mb-4">Claim Sources</h3>

          {/* Display existing claim sources */}
          {claimSourcesArray.fields.map((field, index) => (
            <div key={field.id} className="mb-3 bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">Source {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    claimSourcesArray.remove(index);
                    setValueChange(true);
                  }}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name={`claim_sources.${index}.url`}
                  rules={{ required: "URL required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter url"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setValueChange(true);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`claim_sources.${index}.description`}
                  rules={{ required: "Description required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter description"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setValueChange(true);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          {/* Add new claim source button and inputs */}
          {showClaimInputs ? (
            <div className="mt-2 bg-gray-50 p-3 rounded-md">
              <div className="space-y-2">
                <Input
                  placeholder="Enter url"
                  value={newClaimSource.url}
                  onChange={(e) =>
                    setNewClaimSource({
                      ...newClaimSource,
                      url: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Enter description"
                  value={newClaimSource.description}
                  onChange={(e) =>
                    setNewClaimSource({
                      ...newClaimSource,
                      description: e.target.value,
                    })
                  }
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddClaimSource}
                    disabled={
                      !newClaimSource.url || !newClaimSource.description
                    }
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowClaimInputs(false);
                      setNewClaimSource({ url: "", description: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowClaimInputs(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Claim Source
            </Button>
          )}
        </div>

        {/* Review Sources Column */}
        <div>
          <h3 className="font-medium mb-4">Review Sources</h3>

          {/* Display existing review sources */}
          {reviewSourcesArray.fields.map((field, index) => (
            <div key={field.id} className="mb-3 bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">Source {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    reviewSourcesArray.remove(index);
                    setValueChange(true);
                  }}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name={`review_sources.${index}.url`}
                  rules={{ required: "URL required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter url"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setValueChange(true);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`review_sources.${index}.description`}
                  rules={{ required: "Description required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter description"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setValueChange(true);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          {/* Add new review source button and inputs */}
          {showReviewInputs ? (
            <div className="mt-2 bg-gray-50 p-3 rounded-md">
              <div className="space-y-2">
                <Input
                  placeholder="Enter url"
                  value={newReviewSource.url}
                  onChange={(e) =>
                    setNewReviewSource({
                      ...newReviewSource,
                      url: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Enter description"
                  value={newReviewSource.description}
                  onChange={(e) =>
                    setNewReviewSource({
                      ...newReviewSource,
                      description: e.target.value,
                    })
                  }
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddReviewSource}
                    disabled={
                      !newReviewSource.url || !newReviewSource.description
                    }
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReviewInputs(false);
                      setNewReviewSource({ url: "", description: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowReviewInputs(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Review Source
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourcesSection;
