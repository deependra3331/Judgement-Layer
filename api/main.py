from http.server import BaseHTTPRequestHandler
import os
import json
import urllib.request
import urllib.error

# Logic from server.py extracted for Vercel Serverless Function

def extract_json(text):
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    start_arr = text.find('[')
    end_arr = text.rfind(']')
    start_obj = text.find('{')
    end_obj = text.rfind('}')
    
    if start_arr != -1 and end_arr != -1 and (start_obj == -1 or start_arr < start_obj):
        json_str = text[start_arr:end_arr+1]
    elif start_obj != -1 and end_obj != -1:
        json_str = text[start_obj:end_obj+1]
    else:
        raise Exception("Could not find any JSON array or object in the response: " + text)
        
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse extracted JSON string: {json_str}. Error: {str(e)}")

def call_groq(system_prompt, user_content, api_key=None):
    api_key = api_key or os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise Exception("Groq API Key is missing. Please set it in your Vercel Environment Variables.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; JudgmentLayer/1.0)"
    }
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_content
            }
        ]
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode('utf-8'), 
        headers=headers, 
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            res_json = json.loads(res_data)
            return res_json['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        try:
            err_json = json.loads(err_msg)
            message = err_json.get('error', {}).get('message', err_msg)
        except Exception:
            message = err_msg
        raise Exception(f"Groq API Error: {message}")

def call_gemini(system_prompt, user_content, api_key=None):
    api_key = api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise Exception("Gemini API Key is missing. Please set it in your Vercel Environment Variables.")

    model = "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system_prompt}\n\n{user_content}"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json"
        }
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode('utf-8'), 
        headers=headers, 
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            res_json = json.loads(res_data)
            return res_json['candidates'][0]['content']['parts'][0]['text']
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        try:
            err_json = json.loads(err_msg)
            message = err_json.get('error', {}).get('message', err_msg)
        except Exception:
            message = err_msg
        raise Exception(f"Gemini API Error: {message}")

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "version": "vercel-serverless"}).encode('utf-8'))
        else:
            self.send_error(404, "Static files should be served via vercel.json rewrites")

    def do_POST(self):
        # Clean path to remove query params or hashes
        clean_path = self.path.split('?')[0].split('#')[0]
        
        if clean_path.startswith('/api/analyze/'):
            self.handle_analysis(clean_path)
        elif clean_path == '/api/improve':
            self.handle_improve()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_analysis(self, path):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data.decode('utf-8'))
            
            output_text = params.get('output', '')
            prompt_text = params.get('prompt', '')
            context_type = params.get('context', 'General')
            groq_api_key = params.get('groqApiKey', None)

            if not output_text:
                raise Exception("Input AI-generated output is empty.")

            # Extract endpoint from cleaned path, e.g., /api/analyze/assumptions -> assumptions
            endpoint = path.split('/')[-1]
            
            if endpoint == 'assumptions':
                system_prompt = (
                    "You are an AI output analyst. Given the following AI-generated response, "
                    "identify 3–5 hidden assumptions the AI made while generating it. Be specific and concise. "
                    "Return as bullet points only."
                )
                user_content = (
                    f"AI-Generated Response:\n{output_text}\n\n"
                    f"Original Question (if any):\n{prompt_text}\n\n"
                    f"Context Type: {context_type}\n\n"
                    "Format your response strictly as a JSON array of objects. Do not include markdown bullet symbols. "
                    "Format: [{\"assumption\": \"The assumed fact or style\", \"why_it_matters\": \"Explanation of why this assumption matters to the user (keep it concise)\"}]"
                )
            
            elif endpoint == 'uncertainty':
                system_prompt = (
                    "You are an AI output analyst. Given the following AI-generated response, "
                    "identify 2–3 specific sentences or claims that have low confidence or cannot be easily verified. "
                    "For each, explain in one plain sentence why it is uncertain. Return as a list."
                )
                user_content = (
                    f"AI-Generated Response:\n{output_text}\n\n"
                    "Format your response strictly as a JSON array of objects. "
                    "Format: [{\"sentence\": \"The exact or slightly paraphrased questionable sentence from the response\", \"reason\": \"A plain English explanation of why this claim is uncertain or needs verification\"}]"
                )
            
            elif endpoint == 'context':
                system_prompt = (
                    "You are an AI output analyst. Given the following AI-generated response and the original question, "
                    "identify 2–4 important pieces of context, perspective, or information that are missing from this response. "
                    "For each gap suggest how the student could fill it."
                )
                user_content = (
                    f"AI-Generated Response:\n{output_text}\n\n"
                    f"Original Question (if any):\n{prompt_text}\n\n"
                    f"Context Type: {context_type}\n\n"
                    "Format your response strictly as a JSON array of objects. "
                    "Format: [{\"gap\": \"The identified context gap or missing perspective\", \"how_to_fill\": \"Actionable recommendation for the student to research or add this context\"}]"
                )
            
            elif endpoint == 'prompts':
                system_prompt = (
                    "You are an AI output analyst. Given the following AI-generated response, "
                    "generate 4–5 critical thinking questions a student should ask themselves before trusting and using this output. "
                    "Make each question specific to the content, not generic."
                )
                user_content = (
                    f"AI-Generated Response:\n{output_text}\n\n"
                    "Format your response strictly as a JSON array of objects. "
                    "Format: [{\"question\": \"The specific critical thinking question chip\", \"explanation\": \"A short, insightful explanation of why asking this question matters for validating the output\"}]"
                )

            elif endpoint == 'score':
                system_prompt = (
                    "You are an AI output analyst. Given the following AI-generated response, original prompt, and its context, "
                    "rate the output across four categories: Reasoning Quality, Completeness, Factual Confidence, and Usefulness for the Task. "
                    "Rate each as 'Low', 'Medium', or 'High' and explain why. Finally, write a summary sentence."
                )
                user_content = (
                    f"AI-Generated Response:\n{output_text}\n\n"
                    f"Original Question (if any):\n{prompt_text}\n\n"
                    f"Context Type: {context_type}\n\n"
                    "Format your response strictly as a JSON object with keys: reasoning, completeness, factual_confidence, usefulness, and summary. "
                    "Format:\n"
                    "{\n"
                    "  \"reasoning\": {\"score\": \"Low\"|\"Medium\"|\"High\", \"explanation\": \"A one-sentence explanation\"},\n"
                    "  \"completeness\": {\"score\": \"Low\"|\"Medium\"|\"High\", \"explanation\": \"A one-sentence explanation\"},\n"
                    "  \"factual_confidence\": {\"score\": \"Low\"|\"Medium\"|\"High\", \"explanation\": \"A one-sentence explanation\"},\n"
                    "  \"usefulness\": {\"score\": \"Low\"|\"Medium\"|\"High\", \"explanation\": \"A one-sentence explanation\"},\n"
                    "  \"summary\": \"A short summary line (e.g., 'This output is a good starting point but needs verification on X key points.')\"\n"
                    "}"
                )
            
            else:
                self.send_error(400, "Unknown analysis type")
                return

            raw_response = call_groq(system_prompt, user_content, groq_api_key)
            parsed_data = extract_json(raw_response)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(parsed_data).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def handle_improve(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data.decode('utf-8'))
            
            output_text = params.get('output', '')
            prompt_text = params.get('prompt', '')
            context_type = params.get('context', 'General')
            gemini_api_key = params.get('geminiApiKey', None)
            
            assumptions = params.get('assumptions', [])
            uncertainty = params.get('uncertainty', [])
            context_gaps = params.get('contextGaps', [])

            if not output_text:
                raise Exception("Input AI-generated output is empty.")

            system_prompt = (
                "You are an AI output improver. Given the original AI response, original prompt, and its analysis "
                "(assumptions, flags, missing context), output an improved version of the text that fills in gaps and resolves uncertainty. "
                "Also list the major changes you made and the reasons for them."
            )
            
            user_content = (
                f"Original Prompt:\n{prompt_text}\n\n"
                f"Original Context: {context_type}\n\n"
                f"Original AI Output:\n{output_text}\n\n"
                f"Evaluated Assumptions:\n{json.dumps(assumptions, indent=2)}\n\n"
                f"Evaluated Uncertainty Flags:\n{json.dumps(uncertainty, indent=2)}\n\n"
                f"Evaluated Missing Context Gaps:\n{json.dumps(context_gaps, indent=2)}\n\n"
                "Rewrite the output to be significantly better, directly addressing the assumptions, fixing the uncertainty flags (e.g. verify numbers or state limits), "
                "and adding the missing context elements. Keep it cohesive and polished.\n\n"
                "Format your response strictly as a JSON object with two keys: 'improved_output' and 'changes'.\n"
                "Format:\n"
                "{\n"
                "  \"improved_output\": \"The full text of the revised response. To highlight changes, wrap any added sentences or phrases inside double-asterisks **like this** so the UI can detect them.\",\n"
                "  \"changes\": [\n"
                "    {\"change\": \"Description of what was added or modified\", \"reason\": \"Explanation of why this addresses the evaluation feedback\"}\n"
                "  ]\n"
                "}"
            )

            raw_response = call_gemini(system_prompt, user_content, gemini_api_key)
            parsed_data = extract_json(raw_response)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(parsed_data).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
